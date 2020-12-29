import { globalConfig } from '../config';
import cache from '../cache';
import { FETCH_STRATEGIES, STATES } from '../constants';
import * as utils from '../utils';
import type {
  TContextKeyAndArgs,
  TFn,
  TConfig,
  TResponseOrResponseFn,
  TRecord,
  TLoadingState,
  TSetDataOpts,
  TSetDataRecord,
  TSetErrorOpts,
  TSetSuccessOpts,
  TArgs,
} from '../types';
import { observe } from '../observe';

export function getInitialRecord<TResponse, TError>(contextKeyAndArgs: TContextKeyAndArgs, config?: TConfig<TResponse, TError>) {
  const { cacheStrategy, defer, fetchStrategy, enabled: initialEnabled = true, initialResponse } = {
    ...globalConfig,
    ...config,
  };
  const cachedRecord = cache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
  const [contextKey, args] = utils.getContextKeyAndArgs(contextKeyAndArgs);
  const enabled = !defer && initialEnabled;

  let initialState: TLoadingState = enabled ? STATES.LOADING : STATES.IDLE;
  if (enabled && initialResponse) {
    initialState = STATES.SUCCESS;
  }
  let initialRecord: TRecord<TResponse, TError> = {
    contextKey,
    args,
    contextKeyAndArgs,
    response: initialResponse,
    error: undefined,
    promise: undefined,
    state: initialState,
    isPolling: false,
    ...utils.getStateVariables(initialState),
  };
  if (cachedRecord && enabled) {
    initialRecord = cachedRecord;
  }

  return initialRecord;
}

export default function fetch<TResponse, TError>(
  initialContextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config?: TConfig<TResponse, TError>
) {
  const [contextKey, initialArgs] = utils.getContextKeyAndArgs(initialContextKeyAndArgs);

  ////////////////////////////////////////////////////////////////////////

  const {
    cacheStrategy,
    defer,
    debounceInterval,
    dedupingInterval,
    dedupeManualInvoke,
    enabled: initialEnabled = true,
    errorRetryInterval,
    fetchStrategy,
    invalidateOnSuccess,
    onLoading,
    onError,
    onSuccess,
    pollingInterval,
    pollOnMount,
    pollWhile,
    mutate,
    staleTime,
    timeToSlowConnection,
    subscribe,
  } = { ...globalConfig, ...config };

  ////////////////////////////////////////////////////////////////////////

  let debounceTimeout: any = undefined;
  let errorTimeout: any = undefined;
  let hasUpdater = false;
  let invokeCount = 0;
  let interval: any = undefined;
  let contextKeyAndArgs = initialContextKeyAndArgs;
  let args = initialArgs;
  const enabled = !defer && initialEnabled;

  ////////////////////////////////////////////////////////////////////////

  const initialRecord = getInitialRecord(contextKeyAndArgs, config);

  ////////////////////////////////////////////////////////////////////////

  const proxy = observe(initialRecord, {
    subscribe: (record: TRecord<TResponse, TError>) => {
      subscribe?.(record);

      const { invokedAt, updatedAt, ...updatedRecord } = record;
      cache.upsert(contextKeyAndArgs, updatedRecord, { cacheStrategy, fetchStrategy });

      if (!mutate) {
        args = record.args;
        contextKeyAndArgs = record.contextKeyAndArgs;
      }

      if (!hasUpdater && !invalidateOnSuccess) {
        hasUpdater = true;
        const cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });
        const updaters = cache.updaters.get(cacheKey);
        let updater = { invoke: mutate ? null : (...args: TArgs) => invoke({ force: true })(...args), setSuccess };
        if (updaters) {
          const newUpdaters = [...updaters, updater];
          cache.updaters.set(cacheKey, newUpdaters);
        } else {
          cache.updaters.set(cacheKey, [updater]);
        }
      }

      if (pollWhile) {
        let shouldPoll = typeof pollWhile === 'function' && pollWhile(record);

        if (interval && record.isPolling && !shouldPoll) {
          stopPolling();
        }

        if (!interval && shouldPoll) {
          startPolling();
        }
      }
    },
  });

  ////////////////////////////////////////////////////////////////////////

  if (contextKey && enabled) {
    cache.set(contextKeyAndArgs, initialRecord, { cacheStrategy, fetchStrategy });
  }

  ////////////////////////////////////////////////////////////////////////

  function setArgs(args: TArgs = []) {
    const contextKeyAndArgs = [contextKey, args] as any;
    proxy.record = { ...proxy.record, args, contextKeyAndArgs };
  }

  function setStale() {
    const cachedRecord = cache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
    proxy.record = {
      ...proxy.record,
      ...cachedRecord,
      args: proxy.record.args,
      contextKeyAndArgs: proxy.record.contextKeyAndArgs,
    };
  }

  function setLoading() {
    const state = proxy.record.isIdle || proxy.record.isLoading ? STATES.LOADING : STATES.RELOADING;
    proxy.record = {
      ...proxy.record,
      state,
      ...utils.getStateVariables(state, proxy.record.state),
    };

    onLoading?.(proxy.record);

    let slowConnectionTimeout: any;
    if (typeof timeToSlowConnection === 'number') {
      slowConnectionTimeout = setTimeout(() => {
        const slowState = proxy.record.state === STATES.LOADING ? STATES.LOADING_SLOW : STATES.RELOADING_SLOW;
        proxy.record = {
          ...proxy.record,
          state: slowState,
          ...utils.getStateVariables(slowState, proxy.record.state),
        };
      }, timeToSlowConnection);
    }

    return { slowConnectionTimeout };
  }

  function setData(
    { isBroadcast, localArgs = [], localInvokeCount, setCache, slowConnectionTimeout }: TSetDataOpts,
    { responseOrResponseFn, error, state }: TSetDataRecord<TResponse, TError>
  ) {
    if (slowConnectionTimeout) {
      clearTimeout(slowConnectionTimeout);
    }

    if (isBroadcast && JSON.stringify(localArgs) !== JSON.stringify(args)) return;
    if (!isBroadcast && invokeCount !== localInvokeCount) return;

    let response = responseOrResponseFn;
    if (typeof response === 'function') {
      // @ts-ignore
      response = responseOrResponseFn(proxy.record.response) as TResponse;
    }

    const updatedRecord = {
      error,
      response,
      state,
      ...utils.getStateVariables(state),
    };

    if (setCache) {
      cache.upsert(contextKeyAndArgs, updatedRecord, { cacheStrategy, fetchStrategy });
    }

    proxy.record = { ...proxy.record, ...updatedRecord };

    if (state === STATES.SUCCESS) {
      onSuccess?.(proxy.record);
      return response;
    }
    if (state === STATES.ERROR) {
      onError?.(proxy.record);
      return error;
    }
    return;
  }

  function setSuccess(
    { isBroadcast, localArgs, localInvokeCount, slowConnectionTimeout }: TSetSuccessOpts,
    responseOrResponseFn: TResponseOrResponseFn<TResponse>
  ) {
    const setCache = !mutate;

    const data = setData(
      { isBroadcast, localArgs, localInvokeCount, setCache, slowConnectionTimeout },
      { error: undefined, responseOrResponseFn, state: STATES.SUCCESS }
    );

    if (!isBroadcast) {
      if (invalidateOnSuccess) {
        cache.invalidate(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
      } else {
        cache.broadcastChanges(contextKeyAndArgs, responseOrResponseFn, { cacheStrategy, fetchStrategy });
      }
    }

    return data;
  }

  function setError({ localInvokeCount, slowConnectionTimeout }: TSetErrorOpts, error: TError) {
    setData({ localInvokeCount, setCache: false, slowConnectionTimeout }, { error, state: STATES.ERROR });
    return error;
  }

  function invoke({ force = false, isManualInvoke = false, shouldDebounce = debounceInterval > 0 } = {}) {
    return (...args: TArgs) => {
      args = args.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));
      setArgs(args);

      if (!defer && fetchStrategy !== FETCH_STRATEGIES.FETCH_ONLY) {
        setStale();
      }

      // Deduping logic
      if (dedupingInterval > 0 && !force) {
        const cachedRecord = cache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
        if (cachedRecord) {
          const isDuplicate =
            // @ts-ignore
            Math.abs(new Date() - cachedRecord.invokedAt) < dedupingInterval && (!isManualInvoke || dedupeManualInvoke);
          if (isDuplicate) return;
        }
      }

      // Cache-first logic
      if (fetchStrategy === FETCH_STRATEGIES.CACHE_FIRST && !force) {
        const cachedRecord = cache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
        const isNotStale = staleTime === 0 || Date.now() - cachedRecord.invokedAt < staleTime;
        if (cachedRecord?.isSuccess && isNotStale) {
          return;
        }
      }

      // Debouncing logic
      if (shouldDebounce && !force) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => invoke({ shouldDebounce: false })(...args), debounceInterval);
        return;
      }

      const { slowConnectionTimeout } = setLoading();

      invokeCount = invokeCount + 1;
      const localInvokeCount = invokeCount;

      if (contextKeyAndArgs) {
        cache.upsert(contextKeyAndArgs, { invokedAt: new Date() }, { cacheStrategy, fetchStrategy });
      }

      return fn(...args)
        .then((response) => setSuccess({ localArgs: args, localInvokeCount, slowConnectionTimeout }, response))
        .catch((error) => {
          setError({ localInvokeCount, slowConnectionTimeout }, error);
          if (errorRetryInterval) {
            const attemptCount = Math.min(invokeCount || 0, 8);
            const timeout =
              typeof errorRetryInterval === 'function'
                ? errorRetryInterval(attemptCount)
                : ~~((Math.random() + 0.5) * (1 << attemptCount)) * errorRetryInterval;
            errorTimeout = setTimeout(() => invoke()(...args), timeout);
          }
        });
    };
  }

  function startPolling() {
    if (!interval && pollingInterval && pollingInterval > 0) {
      interval = setInterval(() => {
        invoke({ isManualInvoke: true })(...args);
      }, pollingInterval);
      proxy.record = {
        ...proxy.record,
        isPolling: true,
      };
    }
  }

  function stopPolling() {
    proxy.record = { ...proxy.record, isPolling: false };
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  if (!interval && pollOnMount) {
    startPolling();
  }

  function destroy() {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    stopPolling();

    const cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });
    const updaters = cache.updaters.get(cacheKey);
    if (updaters) {
      const newUpdaters = updaters.filter((updater: any) => updater.setSuccess !== setSuccess);
      cache.updaters.set(cacheKey, newUpdaters);
    }
  }

  if (enabled) {
    invoke()(...initialArgs);
  }

  return {
    destroy,
    initialRecord,
    prefetch: (...args: TArgs) => invoke({ force: true, isManualInvoke: true })(...args),
    invoke: (...args: TArgs) => invoke({ isManualInvoke: true })(...args),
    setSuccess: (data: TResponse) => setSuccess({ isBroadcast: false }, data),
    startPolling,
    stopPolling,
  };
}
