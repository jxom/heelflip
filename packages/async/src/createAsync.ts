import { get, writable } from 'svelte/store';

import { storeCache } from './cache';
import { STATES } from './constants';
import { getStateVariables } from './utils';
import type { TContextArg, TFnArg, TConfig } from './types';

export function createAsync<TResponse, TError>(
  contextKey: TContextArg,
  fn: TFnArg<TResponse>,
  opts: TConfig<TResponse, TError> = {}
) {
  const { defer = false, initialVariables } = opts;

  const cachedStore = storeCache.get(contextKey);
  const cachedRecord = get(cachedStore) as any;

  const initialState = defer ? STATES.IDLE : STATES.LOADING;
  let initialRecord = {
    contextKey,
    variables: initialVariables,
    response: undefined,
    error: undefined,
    state: initialState,
    ...getStateVariables(initialState),
  };
  if (cachedRecord && !defer) {
    initialRecord = cachedRecord;
  }

  const store = writable(initialRecord);

  if (contextKey) {
    storeCache.set(contextKey, store);
  }

  function setLoading() {
    const record = get(store);
    const state = record.isIdle || record.isLoading ? STATES.LOADING : STATES.RELOADING;
    store.set({ ...record, state, ...getStateVariables(state, record.state) });
  }

  function setSuccess({ response }) {
    const record = get(store);
    store.set({
      ...record,
      error: undefined,
      response,
      state: STATES.SUCCESS,
      ...getStateVariables(STATES.SUCCESS),
    });
  }

  function setError({ error }) {
    const record = get(store);
    store.set({
      ...record,
      response: undefined,
      error,
      state: STATES.ERROR,
      ...getStateVariables(STATES.ERROR),
    });
  }

  function invoke(...args) {
    setLoading();
    fn(...args)
      .then((response) => setSuccess({ response }))
      .catch((error) => setError({ error }));
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
  storeCache.set(contextKey, decoratedStore);
  return decoratedStore;
}
