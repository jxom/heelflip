<script>
  import { boomerang } from '../index.ts';
  import todoApi from './api/todo';

  let todoTitle;

  const getTodos = async () => todoApi.getAll();
  const todosStore = boomerang.fetch('todos-invalidate', getTodos);

  const createTodo = async ({ title }) => todoApi.create({ title }, { returnsItems: false });
  const createTodoStore = boomerang.mutate('todos-invalidate', createTodo, { invalidateOnSuccess: true });

  const deleteTodo = async (id) => todoApi.delete(id, { returnsItems: false });
  const deleteTodoStore = boomerang.mutate('todos-invalidate', deleteTodo, { invalidateOnSuccess: true });

  $: {
    console.log($todosStore);
  }
</script>

<div>
  <h1>Todos</h1>
  {#if $todosStore.isLoading}
    <p>Loading...</p>
  {/if}
  {#if $todosStore.isSuccess}
    <input bind:value={todoTitle} />
    <button
      on:click={() => {
        createTodoStore.invoke({ title: todoTitle });
        todoTitle = '';
      }}>
      add
    </button>
    <ul>
      {#each $todosStore.response as todo}
        <li>{todo.title} <button on:click={() => deleteTodoStore.invoke(todo.id)}>Delete</button></li>
      {/each}
    </ul>
  {/if}
  {#if $todosStore.isError}
    <p>Awwies</p>
  {/if}
</div>
