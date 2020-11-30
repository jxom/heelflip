<script>
  import { createAsync } from '../index.ts';

  let getRepos = async () => fetch('https://api.github.com/users/jxom/repos?per_page=99').then((res) => res.json());

  let store = createAsync('repos', getRepos);
</script>

<div>
  <h1>Jake's Repos</h1>
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
