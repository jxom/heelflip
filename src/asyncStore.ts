import { getAsyncStore } from './getAsyncStore';
import { getDeferredAsyncStore } from './getDeferredAsyncStore';
import { setConfig } from './config';

export const asyncStore = {
  fetch: getAsyncStore,
  fetchDeferred: getDeferredAsyncStore({ mutate: false }),
  mutate: getDeferredAsyncStore({ mutate: true }),
  setConfig,
};
