<script>
  import { boomerang } from '../index.ts';
  import todoApi from './api/todo';

  let todoTitle;

  let getTodos = async () => todoApi.getAll();
  let todosStore = boomerang.fetch('todos-invalidate', getTodos);

  let createTodo = async ({ title }) => todoApi.create({ title }, { returnsItems: false });
  let createTodoStore = boomerang.mutate('todos-invalidate', createTodo, { invalidateOnSuccess: true });

  let deleteTodo = async (id) => todoApi.delete(id, { returnsItems: false });
  let deleteTodoStore = boomerang.mutate('todos-invalidate', deleteTodo, { invalidateOnSuccess: true });

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
        }}
      >
        add
      </button>
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
