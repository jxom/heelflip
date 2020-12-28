<script context="module">
  import { getCharacters } from '../utils/api';

  export function preload(page, session) {
    return heelflip.prefetch('characters', () => getCharacters({ fetch: this.fetch })).then(characters => ({ characters }));
  }
</script>

<script>
  import heelflip from 'heelflip/svelte';

  const store = heelflip.fetch('characters', getCharacters);
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
