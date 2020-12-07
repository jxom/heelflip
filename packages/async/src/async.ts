import { get, writable } from 'svelte/store';

import { recordCache } from './cache';
import { CACHE_STRATEGIES, STATES } from './constants';
import * as utils from './utils';
import type { TContextArg, TFnArg, TConfig } from './types';

export function async<TResponse, TError>(
  contextKey: TContextArg,
  fn: TFnArg<TResponse>,
  opts: TConfig<TResponse, TError> = {}
) {
  const { cacheStrategy = CACHE_STRATEGIES.CONTEXT_AND_VARIABLES, defer = false, initialVariables = [] } = opts;

  const cacheKey = utils.getCacheKey({ contextKey, variables: initialVariables, cacheStrategy });
  const cachedRecord = recordCache.get(cacheKey);

  const initialState = defer ? STATES.IDLE : STATES.LOADING;
  let initialRecord = {
    contextKey,
    variables: initialVariables,
    response: undefined,
    error: undefined,
    state: initialState,
    ...utils.getStateVariables(initialState),
  };
  if (cachedRecord && !defer) {
    initialRecord = cachedRecord;
  }

  const store = writable(initialRecord);

  if (contextKey) {
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
  }

  function setSuccess(contextKey, { variables }, response) {
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
  }

  function setError(contextKey, { variables }, error) {
    const record = get(store);
    store.set({
      ...record,
      response: undefined,
      error,
      state: STATES.ERROR,
      ...utils.getStateVariables(STATES.ERROR),
    });
  }

  function invoke(...variables) {
    setStale({ variables });

    setLoading();

    fn(...variables)
      .then((response) => setSuccess(contextKey, { variables }, response))
      .catch((error) => setError(contextKey, { variables }, error));
  }

  if (!defer) {
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
