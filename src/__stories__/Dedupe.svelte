<script>
  import { boomerang } from '../index.ts';

  const getCharacters = async () =>
    fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());
  const store = boomerang.fetch('characters', getCharacters, { dedupingInterval: 1000 });

  $: {
    console.log($store);
  }
</script>

<div>
  <h1>Characters</h1>
  <button on:click={store.invoke}>Fetch again</button>
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
