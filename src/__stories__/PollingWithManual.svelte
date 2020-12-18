<script>
  import { boomerang } from '../index.ts';

  let getCharacters = async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());
  let store = boomerang.fetch('characters', getCharacters, { pollingInterval: 5000, pollOnMount: false });
</script>

<div>
  <h1>Characters</h1>
  {#if $store.isPolling}
    <button on:click={() => store.stopPolling()}>Stop polling</button>
  {:else}
    <button on:click={() => store.startPolling()}>Start polling</button>
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
