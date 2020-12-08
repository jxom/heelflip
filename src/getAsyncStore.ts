import { get, writable } from 'svelte/store';
import { onDestroy } from 'svelte';

import { recordCache, updaterCache } from './cache';
import { CACHE_STRATEGIES, STATES } from './constants';
import * as utils from './utils';
import type { TContextArg, TFnArg, TConfig } from './types';

function broadcastChanges(cacheKey: string, data) {
  const updaters = updaterCache.get(cacheKey);
  if (updaters) {
    updaters.forEach((updater: any) => updater({ shouldBroadcast: false }, data));
  }
}

export function getAsyncStore<TResponse, TError>(
  contextKey: TContextArg,
  fn: TFnArg<TResponse>,
  opts: TConfig<TResponse, TError> = {}
) {
  const { cacheStrategy: initialCacheStrategy = CACHE_STRATEGIES.CONTEXT_ONLY, defer = false, enabled: initialEnabled = true, initialVariables = [], timeToSlowConnection = 3000 } = opts;
  const cacheStrategy = initialVariables.length > 0 ? CACHE_STRATEGIES.CONTEXT_AND_VARIABLES : initialCacheStrategy

  ////////////////////////////////////////////////////////////////////////

  let invokeCount = 0;
  let hasUpdater = false;
  let cacheKey = utils.getCacheKey({ contextKey, variables: initialVariables, cacheStrategy });
  const cachedRecord = recordCache.get(cacheKey);
  const enabled = !defer && initialEnabled;

  ////////////////////////////////////////////////////////////////////////

  const initialState = enabled ? STATES.LOADING : STATES.IDLE;
  let initialRecord = {
    contextKey,
    variables: initialVariables,
    response: undefined,
    error: undefined,
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
    recordCache.set(cacheKey, initialRecord);
  }

  ////////////////////////////////////////////////////////////////////////

  function setVariables(variables) {
    store.update(record => ({ ...record, variables }));
  }

  function setStale() {
    const cachedRecord = recordCache.get(cacheKey);
    store.update(record => ({ ...record, ...cachedRecord }));
  }

  function setLoading() {
    const record = get(store);
    const state = record.isIdle || record.isLoading ? STATES.LOADING : STATES.RELOADING;
    store.set({ ...record, state, ...utils.getStateVariables(state, record.state) });
  
    const slowConnectionTimeout = setTimeout(() => {
      const slowState = record.state === STATES.LOADING ? STATES.LOADING_SLOW : STATES.RELOADING_SLOW
      store.set({ ...record, state: slowState, ...utils.getStateVariables(slowState, record.state) });
    }, timeToSlowConnection);

    return { slowConnectionTimeout };
  }

  function setData({ localInvokeCount, setCache, slowConnectionTimeout }, { response = undefined, error = undefined, state }) {
    if (slowConnectionTimeout) {
      clearTimeout(slowConnectionTimeout);
    }

    if (localInvokeCount && invokeCount !== localInvokeCount) return;
  
    const record = get(store);
    const newRecord = {
      ...record,
      error,
      response,
      state,
      ...utils.getStateVariables(state),
    }
    
    if (setCache) {
      recordCache.set(cacheKey, newRecord)
    }
  
    store.set(newRecord);
  }

  function setSuccess({ localInvokeCount, shouldBroadcast = true, slowConnectionTimeout }, response) {
    setData({ localInvokeCount, setCache: true, slowConnectionTimeout }, { response, state: STATES.SUCCESS })

    if (shouldBroadcast) {
      broadcastChanges(cacheKey, response);
    }
  }

  function setError({ localInvokeCount, slowConnectionTimeout }, error) {
    setData({ localInvokeCount, setCache: false, slowConnectionTimeout }, { error, state: STATES.ERROR })
  }

  ////////////////////////////////////////////////////////////////////////

  function invoke(...variables) {
    variables = variables.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));

    setVariables(variables);

    if (!defer) {
      setStale();
    }

    const { slowConnectionTimeout } = setLoading();

    invokeCount = invokeCount + 1;
    const localInvokeCount = invokeCount;

    fn(...variables)
      .then((response) => setSuccess({ localInvokeCount, slowConnectionTimeout }, response))
      .catch((error) => setError({ localInvokeCount, slowConnectionTimeout }, error));
  }

  if (enabled) {
    invoke(...initialRecord.variables);
  }

  ////////////////////////////////////////////////////////////////////////

  store.subscribe(({ variables }) => {
    cacheKey = utils.getCacheKey({ contextKey, variables, cacheStrategy });

    if (!hasUpdater) {
      hasUpdater = true;
      const updaters = updaterCache.get(cacheKey);
      if (updaters) {
        const newUpdaters = [...updaters, setSuccess];
        updaterCache.set(cacheKey, newUpdaters);
      } else {
        updaterCache.set(cacheKey, [setSuccess]);
      }
    }
  });

  onDestroy(() => {
    const updaters = updaterCache.get(cacheKey);
    const newUpdaters = updaters.filter((updater: any) => updater !== setSuccess);
    updaterCache.set(cacheKey, newUpdaters);
  })

  ////////////////////////////////////////////////////////////////////////

  const decoratedStore = {
    ...store,
    invoke,
    setError,
    setSuccess,
  };
  return decoratedStore;
}
