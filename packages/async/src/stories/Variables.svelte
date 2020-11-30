<script>
  import { createAsync } from '../index.ts';

  let getRepos = async ({ username }) =>
    fetch(`https://api.github.com/users/${username}/repos?per_page=99`).then((res) => res.json());

  let username = 'jxom';
  let store = createAsync('repos', getRepos, { initialVariables: [{ username }] });

  function handleClickFetch() {
    store.invoke({ username });
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
      {#each $store.response as repo}
        <li>{repo.name}</li>
      {/each}
    </ul>
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
