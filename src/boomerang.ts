import { getStore } from './getStore';
import { getDeferredStore } from './getDeferredStore';
import { setConfig } from './config';

export const boomerang = {
  fetch: getStore,
  deferredFetch: getDeferredStore({ mutate: false }),
  mutate: getDeferredStore({ mutate: true }),
  setConfig,
};
