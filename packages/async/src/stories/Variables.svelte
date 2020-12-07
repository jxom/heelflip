<script>
  import { async, recordCache } from '../index.ts';

  let getRepos = async ({ username }) =>
    fetch(`https://rickandmortyapi.com/api/character?name=${username}`).then((res) => res.json());

  let username = 'rick';
  let store = async('repos', getRepos, { initialVariables: [{ username }] });

  function handleClickFetch() {
    store.invoke({ username });
  }

  $: {
    console.log($store);
    console.log(recordCache.entries())
  }
</script>

<div>
  <input bind:value={username} />
  <button on:click={handleClickFetch}>
    {#if $store.isReloading}Fetching...{:else}Fetch{/if}
  </button>
  {#if $store.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $store.isSuccess}
    <ul>
      {#each $store.response.results as repo}
        <li>{repo.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
