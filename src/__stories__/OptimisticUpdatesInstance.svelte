<script>
  import { asyncStore, storeCache } from '../index.ts';
  import todoApi from './api/todo';

  let todoTitle;

  let getTodos = async () => todoApi.getAll();
  let todosStore = asyncStore.fetch('todos', getTodos);

  let createTodo = async ({ title }) => todoApi.create({ title }, { returnsItems: true });
  let createTodoStore = asyncStore.mutate('todos', createTodo);

  let deleteTodo = async (id) => todoApi.delete(id, { returnsItems: true });
  let deleteTodoStore = asyncStore.mutate('todos', deleteTodo);

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
        todosStore.setSuccess(response => [...response, { id: response.length + 1, title: todoTitle }]);
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
