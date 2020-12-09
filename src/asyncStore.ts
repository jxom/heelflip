import { getAsyncStore } from "./getAsyncStore";
import { getDeferredAsyncStore } from "./getDeferredAsyncStore";

export const asyncStore = {
  fetch: getAsyncStore,
  fetchDeferred: getDeferredAsyncStore({ mutate: false }),
  mutate: getDeferredAsyncStore({ mutate: true })
}
