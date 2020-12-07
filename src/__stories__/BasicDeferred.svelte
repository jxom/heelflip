<script>
  import { asyncStore } from '../src/index.ts';

  let getRepos = async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());

  let store = asyncStore.fetchDeferred('characters', getRepos);

  $: {
    console.log($store);
  }
</script>

<div>
  <h1>Characters</h1>
  {#if $store.isIdle}
    <button on:click={store.invoke}>Load</button>
  {/if}
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
