<script context="module">
  import { getCharacters } from '../utils/api';

  export async function preload(page, session) {
    session.heelflipCache.set('test', { test: 'test' });
    const characters = await getCharacters({ fetch: this.fetch });
    return { characters };
  }
</script>

<script>
  import heelflip from 'heelflip/svelte';
  import { stores } from '@sapper/app';

  export let characters;

  const { session } = stores();

  console.log('cache', $session.heelflipCache);

  const store = heelflip.fetch('characters', getCharacters, { initialResponse: characters });
</script>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

<div>
  <h1>Characters</h1>
  {#if $store.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $store.isSuccess}
    <ul>
      {#each $store.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
