import { get, writable } from 'svelte/store';
import { onDestroy } from 'svelte';

import { globalConfig } from './config';
import { recordCache } from './cache';
import { CACHE_STRATEGIES, FETCH_STRATEGIES, STATES } from './constants';
import * as utils from './utils';
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
} from './types';

export function getAsyncStore<TResponse, TError>(
  initialContextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config: TConfig<TResponse, TError> = {}
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
    fetchStrategy,
    onError,
    onSuccess,
    pollingInterval,
    pollOnMount,
    pollWhile,
    mutate,
    invalidateOnSuccess,
    timeToSlowConnection,
  } = { ...globalConfig, ...config };

  ////////////////////////////////////////////////////////////////////////

  let debounceTimeout: number | undefined = undefined;
  let invokeCount = 0;
  let hasUpdater = false;
  let contextKeyAndArgs = initialContextKeyAndArgs;
  let args = initialArgs;
  const cachedRecord = recordCache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
  const enabled = !defer && initialEnabled;

  ////////////////////////////////////////////////////////////////////////

  const initialState: TLoadingState = enabled ? STATES.LOADING : STATES.IDLE;
  let initialRecord: TRecord<TResponse, TError> = {
    contextKey,
    args,
    contextKeyAndArgs,
    response: undefined,
    error: undefined,
    promise: undefined,
    state: initialState,
    ...utils.getStateVariables(initialState),
  };
  if (cachedRecord && enabled) {
    initialRecord = cachedRecord;
  }

  ////////////////////////////////////////////////////////////////////////

  const store = writable(initialRecord);

  ////////////////////////////////////////////////////////////////////////

  if (contextKey && enabled) {
    recordCache.set(contextKeyAndArgs, initialRecord, { cacheStrategy, fetchStrategy });
  }

  ////////////////////////////////////////////////////////////////////////

  function setArgs(args: TArgs = []) {
    const contextKeyAndArgs = [contextKey, args] as any;
    store.update((record) => ({ ...record, args, contextKeyAndArgs }));
  }

  function setStale() {
    const cachedRecord = recordCache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
    store.update((record) => ({
      ...record,
      ...cachedRecord,
      args: record.args,
      contextKeyAndArgs: record.contextKeyAndArgs,
    }));
  }

  function setLoading() {
    const record = get(store);
    const state = record.isIdle || record.isLoading ? STATES.LOADING : STATES.RELOADING;
    store.set({ ...record, state, ...utils.getStateVariables(state, record.state) });

    let slowConnectionTimeout;
    if (typeof timeToSlowConnection === 'number') {
      slowConnectionTimeout = setTimeout(() => {
        const record = get(store);
        const slowState = record.state === STATES.LOADING ? STATES.LOADING_SLOW : STATES.RELOADING_SLOW;
        store.set({ ...record, state: slowState, ...utils.getStateVariables(slowState, record.state) });
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

    const record = get(store);

    let response = responseOrResponseFn;
    if (typeof response === 'function') {
      // @ts-ignore
      response = responseOrResponseFn(record.response) as TResponse;
    }

    if (state === STATES.SUCCESS) {
      onSuccess?.(response);
    }
    if (state === STATES.ERROR) {
      onError?.(error);
    }

    const newRecord = {
      error,
      response,
      state,
      ...utils.getStateVariables(state),
    };

    if (setCache) {
      recordCache.upsert(contextKeyAndArgs, newRecord, { cacheStrategy, fetchStrategy });
    }

    store.set({ ...record, ...newRecord });
  }

  function setSuccess(
    { isBroadcast, localArgs, localInvokeCount, slowConnectionTimeout }: TSetSuccessOpts,
    responseOrResponseFn: TResponseOrResponseFn<TResponse>
  ) {
    const setCache = !mutate;

    setData(
      { isBroadcast, localArgs, localInvokeCount, setCache, slowConnectionTimeout },
      { error: undefined, responseOrResponseFn, state: STATES.SUCCESS }
    );

    if (!isBroadcast) {
      if (invalidateOnSuccess) {
        recordCache.invalidate(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
      } else {
        recordCache.broadcastChanges(contextKeyAndArgs, responseOrResponseFn, { cacheStrategy, fetchStrategy });
      }
    }
  }

  function setError({ localInvokeCount, slowConnectionTimeout }: TSetErrorOpts, error: TError) {
    setData({ localInvokeCount, setCache: false, slowConnectionTimeout }, { error, state: STATES.ERROR });
  }

  ////////////////////////////////////////////////////////////////////////

  function invoke({ isManualInvoke = false, shouldDebounce = debounceInterval > 0 } = {}) {
    return (...args: TArgs) => {
      args = args.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));

      setArgs(args);

      if (!defer && fetchStrategy !== FETCH_STRATEGIES.FETCH_ONLY) {
        setStale();
      }

      // Deduping logic
      if (dedupingInterval > 0) {
        const cachedRecord = recordCache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
        if (cachedRecord) {
          const isDuplicate =
            // @ts-ignore
            Math.abs(new Date() - cachedRecord.invokedAt) < dedupingInterval && (!isManualInvoke || dedupeManualInvoke);
          if (isDuplicate) return;
        }
      }

      // Cache-first logic
      if (fetchStrategy === FETCH_STRATEGIES.CACHE_FIRST) {
        const cachedRecord = recordCache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
        if (cachedRecord?.isSuccess) {
          return;
        }
      }

      // Debouncing logic
      if (shouldDebounce) {
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
        recordCache.upsert(contextKeyAndArgs, { invokedAt: new Date() }, { cacheStrategy, fetchStrategy });
      }

      fn(...args)
        .then((response) => setSuccess({ localArgs: args, localInvokeCount, slowConnectionTimeout }, response))
        .catch((error) => setError({ localInvokeCount, slowConnectionTimeout }, error));
    };
  }

  if (enabled) {
    invoke()(...initialRecord.args);
  }

  ////////////////////////////////////////////////////////////////////////

  let interval: any = undefined;

  function startPolling() {
    if (!interval && pollingInterval && pollingInterval > 0) {
      interval = setInterval(() => {
        invoke({ isManualInvoke: true })(...args);
      }, pollingInterval);
      store.update((record) => ({ ...record, isPolling: true }));
    }
  }

  function stopPolling() {
    store.update((record) => ({ ...record, isPolling: false }));
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  if (!interval && pollOnMount) {
    startPolling();
  }

  store.subscribe((record) => {
    if (pollWhile) {
      let shouldPoll = typeof pollWhile === 'function' && pollWhile(record);

      if (interval && !shouldPoll) {
        stopPolling();
      }

      if (!interval && shouldPoll) {
        console.log('starting2');
        startPolling();
      }
    }
  });

  onDestroy(() => {
    stopPolling();
  });

  ////////////////////////////////////////////////////////////////////////

  store.subscribe(({ args: _args, contextKeyAndArgs: _contextKeyAndArgs }) => {
    if (!mutate) {
      args = _args;
      contextKeyAndArgs = _contextKeyAndArgs;
    }

    if (!hasUpdater && !invalidateOnSuccess) {
      hasUpdater = true;
      const cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });
      const updaters = recordCache.updaters.get(cacheKey);
      let updater = { invoke: mutate ? null : (...args: TArgs) => invoke()(...args), setSuccess };
      if (updaters) {
        const newUpdaters = [...updaters, updater];
        recordCache.updaters.set(cacheKey, newUpdaters);
      } else {
        recordCache.updaters.set(cacheKey, [updater]);
      }
    }
  });

  onDestroy(() => {
    const cacheKey = utils.getCacheKey({ contextKeyAndArgs, cacheStrategy });
    const updaters = recordCache.updaters.get(cacheKey);
    if (updaters) {
      const newUpdaters = updaters.filter((updater: any) => updater.setSuccess !== setSuccess);
      recordCache.updaters.set(cacheKey, newUpdaters);
    }
  });

  ////////////////////////////////////////////////////////////////////////

  const decoratedStore = {
    ...store,
    invoke: (...args: TArgs) => invoke({ isManualInvoke: true })(...args),
    setSuccess: (data: TResponse) => setSuccess({ isBroadcast: false }, data),
    startPolling,
    stopPolling,
  };
  return decoratedStore;
}
