import fetch from './fetch';
import deferredFetch from '../core/deferredFetch';
import { setConfig } from '../config';

export default {
  fetch,
  deferredFetch: deferredFetch({ fetch, mutate: false }),
  mutate: deferredFetch({ fetch, mutate: true }),
  setConfig,
};
