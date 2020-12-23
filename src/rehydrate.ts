import { onDestroy } from 'svelte';
import { boomerangCache } from './index';
// @ts-ignore
import serialize from 'serialize-javascript';

export function rehydrate(session: any) {
  // @ts-ignore
  if (!process.browser) {
    onDestroy(() => {
      // Replace apollo client with its cache for serialization
      // session.cache = session.cache.getAll();
      session.boomerangCache = serialize(session.boomerangCache.getAll());
    });
  } else {
    const deserializedCache = eval('(' + session.boomerangCache + ')');
    boomerangCache.restore(deserializedCache)
    session.boomerangCache = boomerangCache;
  }
}