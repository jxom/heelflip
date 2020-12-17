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
    enabled: initialEnabled = true,
    fetchStrategy,
    mutate,
    invalidateOnSuccess,
    timeToSlowConnection,
  } = { ...globalConfig, ...config };

  ////////////////////////////////////////////////////////////////////////

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
    { isBroadcast, localArgs, localInvokeCount, setCache, slowConnectionTimeout }: TSetDataOpts,
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

    const newRecord = {
      ...record,
      error,
      response,
      state,
      ...utils.getStateVariables(state),
    };

    if (setCache) {
      recordCache.set(contextKeyAndArgs, newRecord, { cacheStrategy, fetchStrategy });
    }

    store.set(newRecord);
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
    setData(
      { localInvokeCount, setCache: false, slowConnectionTimeout },
      { error, state: STATES.ERROR }
    );
  }

  ////////////////////////////////////////////////////////////////////////

  function invoke(...args: TArgs) {
    args = args.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));

    setArgs(args);

    if (!defer && fetchStrategy !== FETCH_STRATEGIES.FETCH_ONLY) {
      setStale();
    }

    if (fetchStrategy === FETCH_STRATEGIES.CACHE_FIRST) {
      const cachedRecord = recordCache.get(contextKeyAndArgs, { cacheStrategy, fetchStrategy });
      if (cachedRecord?.isSuccess) {
        return;
      }
    }

    const { slowConnectionTimeout } = setLoading();

    invokeCount = invokeCount + 1;
    const localInvokeCount = invokeCount;

    fn(...args)
      .then((response) => setSuccess({ localArgs: args, localInvokeCount, slowConnectionTimeout }, response))
      .catch((error) => setError({ localInvokeCount, slowConnectionTimeout }, error));
  }

  if (enabled) {
    invoke(...initialRecord.args);
  }

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
      let updater = { invoke: mutate ? null : invoke, setSuccess };
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
    invoke,
    setSuccess: (data: TResponse) => setSuccess({ isBroadcast: false }, data),
  };
  return decoratedStore;
}
