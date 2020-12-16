<script>
  import { asyncStore, storeCache } from '../index.ts';

  let username = 'rick';
  let getCharacters = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());
  let store = asyncStore.fetch(['characters', [{ username }]], getCharacters);

  $: {
    console.log($store);
  }
</script>

<div>
  <h1>Characters</h1>
  <button on:click={() => storeCache.invalidate(['characters', [{ username: 'rick' }]])}>
    {#if $store.isReloading}Invalidating...{:else}Invalidate{/if}
  </button>
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
