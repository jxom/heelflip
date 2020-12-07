import { get, writable } from 'svelte/store';

import { recordCache } from './cache';
import { CACHE_STRATEGIES, STATES } from './constants';
import * as utils from './utils';
import type { TContextArg, TFnArg, TConfig } from './types';

export function getAsyncStore<TResponse, TError>(
  contextKey: TContextArg,
  fn: TFnArg<TResponse>,
  opts: TConfig<TResponse, TError> = {}
) {
  const { cacheStrategy = CACHE_STRATEGIES.CONTEXT_AND_VARIABLES, defer = false, enabled: initialEnabled = true, initialVariables = [], timeToSlowConnection = 3000 } = opts;

  ////////////////////////////////////////////////////////////////////////

  let invokeCount = 0;
  const cacheKey = utils.getCacheKey({ contextKey, variables: initialVariables, cacheStrategy });
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

  function setStale({ variables }) {
    const cacheKey = utils.getCacheKey({ contextKey, variables, cacheStrategy });
    const cachedRecord = recordCache.get(cacheKey);
    const record = get(store);
    store.set({ ...record, ...cachedRecord });
  }

  function setLoading() {
    const record = get(store);
    const state = record.isIdle || record.isLoading ? STATES.LOADING : STATES.RELOADING;
    store.set({ ...record, state, ...utils.getStateVariables(state, record.state) });
  
    const slowConnectionTimeout = setTimeout(() => {
      const slowState = state === STATES.LOADING ? STATES.LOADING_SLOW : STATES.RELOADING_SLOW
      store.set({ ...record, state: slowState, ...utils.getStateVariables(slowState, record.state) });
    }, timeToSlowConnection);

    return { slowConnectionTimeout };
  }

  function setData(contextKey, { localInvokeCount, setCache, slowConnectionTimeout, variables }, { response = undefined, error = undefined, state }) {
    clearTimeout(slowConnectionTimeout);

    if (invokeCount !== localInvokeCount) return;
  
    const record = get(store);
    const newRecord = {
      ...record,
      error,
      response,
      state,
      ...utils.getStateVariables(state),
    }
    
    if (setCache) {
      const cacheKey = utils.getCacheKey({ contextKey, variables, cacheStrategy });
      recordCache.set(cacheKey, newRecord)
    }
  
    store.set(newRecord);
  }

  function setSuccess(contextKey, { localInvokeCount, slowConnectionTimeout, variables }, response) {
    setData(contextKey, { localInvokeCount, setCache: true, slowConnectionTimeout, variables }, { response, state: STATES.SUCCESS })
  }

  function setError(contextKey, { localInvokeCount, slowConnectionTimeout, variables }, error) {
    setData(contextKey, { localInvokeCount, setCache: false, slowConnectionTimeout, variables }, { error, state: STATES.ERROR })
  }

  ////////////////////////////////////////////////////////////////////////

  function invoke(...variables) {
    variables = variables.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));

    if (!defer) {
      setStale({ variables });
    }

    const { slowConnectionTimeout } = setLoading();

    invokeCount = invokeCount + 1;
    const localInvokeCount = invokeCount;

    fn(...variables)
      .then((response) => setSuccess(contextKey, { localInvokeCount, slowConnectionTimeout, variables }, response))
      .catch((error) => setError(contextKey, { localInvokeCount, slowConnectionTimeout, variables }, error));
  }

  if (enabled) {
    invoke(...initialRecord.variables);
  }

  ////////////////////////////////////////////////////////////////////////

  const decoratedStore = {
    ...store,
    invoke,
    setError,
    setSuccess,
  };
  return decoratedStore;
}
