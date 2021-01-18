import useFetch from './useFetch';
import deferredFetch from '../core/deferredFetch';
import prefetch from '../core/prefetch';
import { setConfig } from '../config';

export { ConfigProvider } from './ConfigContext'

export default {
  useFetch,
  useDeferredFetch: deferredFetch({ fetch: useFetch, mutate: false }),
  useMutate: deferredFetch({ fetch: useFetch, mutate: true }),
  prefetch,
  setConfig,
};
