<script>
  import { async } from '../index.ts';

  let getRepos = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());

  let username = 'rick';
  let charactersStore = async.fetch('characters', getRepos, { enabled: false, initialVariables: [{ username }] });

  function handleClickFetch() {
    charactersStore.invoke({ username });
  }

  $: {
    console.log($charactersStore);
  }
</script>

<div>
  <input bind:value={username} />
  <button on:click={handleClickFetch}>
    {#if $charactersStore.isReloading}Fetching...{:else}Fetch{/if}
  </button>
  {#if $charactersStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $charactersStore.isSuccess}
    <ul>
      {#each $charactersStore.response.results as character}
        <li>{character.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $charactersStore.isError}
    <p>Awwies</p>
  {/if}
</div>
