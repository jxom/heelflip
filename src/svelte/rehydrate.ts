import { onDestroy } from 'svelte';
import heelflipCache from '../cache';
// @ts-ignore
import serialize from 'serialize-javascript';

export function rehydrate(session: any) {
  // @ts-ignore
  if (!process.browser) {
    onDestroy(() => {
      // Replace apollo client with its cache for serialization
      // session.cache = session.cache.getAll();
      session.heelflipCache = serialize(session.heelflipCache.getAll());
    });
  } else {
    const deserializedCache = eval('(' + session.heelflipCache + ')');
    heelflipCache.restore(deserializedCache)
    session.heelflipCache = heelflipCache;
  }
}