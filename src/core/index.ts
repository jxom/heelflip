import fetch from './fetch';
import prefetch from './prefetch';
import deferredFetch from './deferredFetch';
import { setConfig } from '../config';

export default {
  fetch,
  prefetch,
  deferredFetch: deferredFetch({ fetch, mutate: false }),
  mutate: deferredFetch({ fetch, mutate: true }),
  setConfig,
};
