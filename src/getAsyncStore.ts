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

  const enabled = !defer && initialEnabled;

  const cacheKey = utils.getCacheKey({ contextKey, variables: initialVariables, cacheStrategy });
  const cachedRecord = recordCache.get(cacheKey);

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

  const store = writable(initialRecord);

  if (contextKey && enabled) {
    recordCache.set(cacheKey, initialRecord);
  }

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

  function setSuccess(contextKey, { slowConnectionTimeout, variables }, response) {
    const cacheKey = utils.getCacheKey({ contextKey, variables, cacheStrategy });
    const record = get(store);
    const newRecord = {
      ...record,
      error: undefined,
      response,
      state: STATES.SUCCESS,
      ...utils.getStateVariables(STATES.SUCCESS),
    }
    
    recordCache.set(cacheKey, newRecord)
    store.set(newRecord);
  
    clearTimeout(slowConnectionTimeout);
  }

  function setError(contextKey, { slowConnectionTimeout, variables }, error) {
    const record = get(store);
    const newRecord = {
      ...record,
      response: undefined,
      error,
      state: STATES.ERROR,
      ...utils.getStateVariables(STATES.ERROR),
    };
  
    store.set(newRecord);

    clearTimeout(slowConnectionTimeout);
  }

  function invoke(...variables) {
    variables = variables.filter((arg: any) => arg.constructor.name !== 'Class' && !arg.constructor.name.includes('Event'));

    if (!defer) {
      setStale({ variables });
    }

    const { slowConnectionTimeout } = setLoading();

    fn(...variables)
      .then((response) => setSuccess(contextKey, { slowConnectionTimeout, variables }, response))
      .catch((error) => setError(contextKey, { slowConnectionTimeout, variables }, error));
  }

  if (enabled) {
    invoke(...initialRecord.variables);
  }

  const decoratedStore = {
    ...store,
    invoke,
    setError,
    setSuccess,
  };
  return decoratedStore;
}
