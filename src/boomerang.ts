import { getAsyncStore } from './getAsyncStore';
import { getDeferredAsyncStore } from './getDeferredAsyncStore';
import { setConfig } from './config';

export const boomerang = {
  fetch: getAsyncStore,
  deferredFetch: getDeferredAsyncStore({ mutate: false }),
  mutate: getDeferredAsyncStore({ mutate: true }),
  setConfig,
};
