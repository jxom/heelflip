<script>
  import { asyncStore } from '../index.ts';
  import todoApi from './api/todo';

  let getTodos = async () => todoApi.getAll();
  let todosStore = asyncStore.fetch('todos', getTodos);

  let deleteTodo = async (id) => todoApi.delete(id, { returnsItems: true });
  let deleteTodoStore = asyncStore.mutate('todos', deleteTodo);

  $: {
    console.log('todosStore', $todosStore);
  }

  $: {
    console.log('deleteTodoStore', $deleteTodoStore);
  }
</script>

<div>
  <h1>Todos</h1>
  {#if $todosStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $todosStore.isSuccess}
    <ul>
      {#each $todosStore.response as todo}
        <li>
          {todo.title}
          <button on:click={() => deleteTodoStore.invoke(todo.id)}>Delete</button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $todosStore.isError}
    <p>Awwies</p>
  {/if}
</div>
