import { useRef, useEffect, useState } from 'react';

import type { TContextKeyAndArgs, TFn, TConfig } from '../types';
import heelflip from '../core';
import { getInitialRecord } from '../core/fetch';

export default function useFetch<TResponse, TError>(
  contextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config: TConfig<TResponse, TError> = {}
) {
  const {
    cacheProvider,
    cacheStrategy,
    cacheTime,
    defer,
    debounceInterval,
    dedupingInterval,
    dedupeManualInvoke,
    enabled,
    errorRetryInterval,
    fetchStrategy,
    initialResponse,
    invalidateOnSuccess,
    mutate,
    onLoading,
    onError,
    onSuccess,
    pollingInterval,
    pollOnMount,
    pollWhile,
    staleTime,
    timeToSlowConnection,
  } = config;
  const fetch = useRef<any>({});
  const [record, setState] = useState(() => getInitialRecord(contextKeyAndArgs, config));

  useEffect(() => {
    fetch.current = heelflip.fetch(contextKeyAndArgs, fn, {
      cacheProvider,
      cacheStrategy,
      cacheTime,
      defer,
      debounceInterval,
      dedupingInterval,
      dedupeManualInvoke,
      enabled,
      errorRetryInterval,
      fetchStrategy,
      initialResponse,
      invalidateOnSuccess,
      mutate,
      onLoading,
      onError,
      onSuccess,
      pollingInterval,
      pollOnMount,
      pollWhile,
      staleTime,
      timeToSlowConnection,
      subscribe: (record) => setState(record),
    });
    setState(fetch.current.initialRecord);
    return () => fetch.current.destroy();
  }, [
    JSON.stringify(contextKeyAndArgs),
    cacheProvider,
    cacheStrategy,
    cacheTime,
    debounceInterval,
    dedupeManualInvoke,
    dedupingInterval,
    defer,
    enabled,
    errorRetryInterval,
    fetchStrategy,
    fn,
    initialResponse,
    invalidateOnSuccess,
    mutate,
    onError,
    onLoading,
    onSuccess,
    pollOnMount,
    pollWhile,
    pollingInterval,
    staleTime,
    timeToSlowConnection,
  ]);

  ////////////////////////////////////////////////////////////////////////

  const decoratedRecord = {
    ...record,
    invoke: fetch.current.invoke,
    setSuccess: fetch.current.setSuccess,
    startPolling: fetch.current.startPolling,
    stopPolling: fetch.current.stopPolling,
  };
  return decoratedRecord;
}
