<script>
  import { Async } from '../index.ts';

  let getRepos = async () => fetch('https://api.github.com/users/jxom/repos').then((res) => res.json());
</script>

<Async fn={getRepos} let:record={record}>
  {#if record.isLoading}
    <p>Loading...</p>
  {/if}
  {#if record.isSuccess}
    <p>Great success! ${JSON.stringify(record.response)}</p>
  {/if}
  {#if record.isError}
    <p>Awwies</p>
  {/if}
</Async>
