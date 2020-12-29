import { useRef, useEffect, useState } from 'react';

import type {
  TContextKeyAndArgs,
  TFn,
  TConfig,
} from '../types';
import heelflip from '../core';
import { getInitialRecord } from '../core/fetch';

export default function useFetch<TResponse, TError>(
  initialContextKeyAndArgs: TContextKeyAndArgs,
  fn: TFn<TResponse>,
  config: TConfig<TResponse, TError> = {}
) {
  const fetch = useRef<any>({});
  const [record, setState] = useState(() => getInitialRecord(initialContextKeyAndArgs, config));
  
  useEffect(() => {
    fetch.current = heelflip.fetch(
      initialContextKeyAndArgs,
      fn,
      {
        ...config,
        subscribe: (record) => setState(record),
      }
    );
    setState(fetch.current.initialRecord);
    return () => fetch.current.destroy();
  }, []);

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
