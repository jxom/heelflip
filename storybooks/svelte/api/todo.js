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
    console.log('getAll()');
    return new Promise((res) => setTimeout(() => res(this.todos), 1000));
  },
  async create({ title }, { returnsItems = true }) {
    console.log(`create({ ${title} })`);
    return new Promise((res) => {
      this.todos.push({ id: this.todos.length + 1, title });

      setTimeout(() => {
        if (returnsItems) {
          res(this.todos);
        } else {
          res();
        }
      }, 200);
    });
  },
  async delete(id, { returnsItems = true }) {
    console.log(`delete(${id})`);
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
