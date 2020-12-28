import fetch from './fetch';
import deferredFetch from '../core/deferredFetch';
import prefetch from '../core/prefetch';
import { setConfig } from '../config';

export default {
  fetch,
  prefetch,
  deferredFetch: deferredFetch({ fetch, mutate: false }),
  mutate: deferredFetch({ fetch, mutate: true }),
  setConfig,
};
