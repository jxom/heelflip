<script>
  import { deferredAsync } from '../index.ts';

  let getRepos = async () => fetch('https://rickandmortyapi.com/api/character?name=rick').then((res) => res.json());

  let store = deferredAsync(getRepos);
</script>

<div>
  <h1>Jake's Repos</h1>
  {#if $store.isIdle}
    <button on:click={store.invoke}>Load</button>
  {/if}
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
