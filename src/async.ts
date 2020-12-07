import { getAsyncStore } from "./getAsyncStore";
import { getDeferredAsyncStore } from "./getDeferredAsyncStore";

export const async = {
  fetch: getAsyncStore,
  fetchDeferred: getDeferredAsyncStore,
  mutate: getDeferredAsyncStore
}
