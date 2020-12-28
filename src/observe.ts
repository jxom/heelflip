import type { TRecord } from './types';

export function observe<TResponse, TError>(
  record: TRecord<TResponse, TError>,
  { subscribe }: { subscribe: (record: TRecord<TResponse, TError>) => void }
) {
  const cb = {
    set: function (_: any, key: string, value: any) {
      if (key === 'record') {
        subscribe?.(value);
      }
      // @ts-ignore
      return Reflect.set(...arguments);
    },
  };
  const target = { record };
  const proxy = new Proxy(target, cb);
  proxy.record = { ...proxy.record };
  return proxy;
}
