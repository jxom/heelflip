<script>
  import heelflip from '../../src/svelte';
  import todoApi from './api/todo';

  let todoTitle;

  const getTodos = async () => todoApi.getAll();
  const todosStore = heelflip.fetch('todos', getTodos);

  const createTodo = async ({ title }) => todoApi.create({ title }, { returnsItems: true });
  const createTodoStore = heelflip.mutate('todos', createTodo);

  const deleteTodo = async (id) => todoApi.delete(id, { returnsItems: true });
  const deleteTodoStore = heelflip.mutate('todos', deleteTodo);

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
        todosStore.setSuccess((todos) => [...todos, { id: todos.length + 1, title: todoTitle }]);
        createTodoStore.invoke({ title: todoTitle });
        todoTitle = '';
      }}>
      add
    </button>
    <ul>
      {#each $todosStore.response as todo}
        <li>
          {todo.title}
          <button
            on:click={() => {
              todosStore.setSuccess((todos) => todos.filter(t => t.id !== todo.id));
              deleteTodoStore.invoke(todo.id);
            }}>Delete</button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if $todosStore.isError}
    <p>Awwies</p>
  {/if}
</div>
