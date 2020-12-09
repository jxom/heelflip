export default {
  todos: [
    {
      id: 1,
      title: 'Do the shopping',
    },
    {
      id: 2,
      title: 'Feed the fish',
    },
    {
      id: 3,
      title: 'Pat the dog',
    },
    {
      id: 4,
      title: 'Play football',
    },
    {
      id: 5,
      title: 'Drink red bull',
    },
  ],
  async getAll() {
    return new Promise((res) => setTimeout(() => res(this.todos), 1000));
  },
  delete(id, { returnsItems = true }) {
    return new Promise((res) => {
      this.todos = this.todos.filter((todo) => todo.id !== id);

      setTimeout(() => {
        if (returnsItems) {
          res(this.todos);
        } else {
          res();
        }
      }, 200);
    });
  },
};
