<script>
  import { boomerang } from '../index.ts';

  let users = {
    0: {
      name: 'Jake'
    },
    1: {
      name: 'John'
    },
    2: {
      name: 'Peter'
    }
  }
  let getUser = async (id) => {
    return new Promise(res => {
      setTimeout(() => res(users[id]), id * 1000);
    })
  };

  let store = boomerang.fetch('users', getUser, { enabled: false });

  $: {
    console.log($store);
  }
</script>

<div>
  <h1>Users</h1>
  {#each Object.values(users) as user, i}
    <button on:click={() => store.invoke(i)}>{user.name}</button>
    <br/>
  {/each}
  {#if $store.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $store.isSuccess}
    {$store.response.name}
  {/if}
  {#if $store.isError}
    <p>Awwies</p>
  {/if}
</div>
