import { writable } from 'svelte/store';
import { onDestroy } from 'svelte';

import type {
  TContextKeyAndArgs,
  TFn,
  TConfig,
} from '../types';
import heelflip from '../core';

export default function fetch<TResponse, TError>(
  initialContextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config: TConfig<TResponse, TError> = {}
) {
  const store = writable({});

  const { destroy, initialRecord, invoke, setSuccess, startPolling, stopPolling } = heelflip.fetch(
    initialContextKeyAndArgs,
    fn,
    {
      ...config,
      subscribe: (record) => store.set(record),
    }
  );

  store.set(initialRecord);

  onDestroy(() => destroy());

  ////////////////////////////////////////////////////////////////////////

  const decoratedStore = {
    ...store,
    invoke,
    setSuccess,
    startPolling,
    stopPolling,
  };
  return decoratedStore;
}
