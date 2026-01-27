
const kv = await Deno.openKv();

export interface Task {
  id: string;
  name: string;
  completed: boolean;
}

  // Pobieranie wszystkich tasków
export const TaskRepository = {
  async getAll(): Promise<Task[]> {
    const tasks: Task[] = [];
    const entries = kv.list({ prefix: ["tasks"] });
    for await (const entry of entries) {
      tasks.push(entry.value as Task);
    }
    return tasks;
  },

  // Zapisywanie
  async save(name: string): Promise<Task> {
    const id = crypto.randomUUID();
    const newTask: Task = { id, name, completed: false };
    await kv.set(["tasks", id], newTask);
    return newTask;
  },

  // Usuwanie
  async delete(id: string): Promise<void> {
    await kv.delete(["tasks", id]);
  },

  // Edytowanie
  async update(id: string, newName: string): Promise<Task | null> {
    const res = await kv.get(["tasks", id]);
    const task = res.value as Task | null;

    if (task) {
      task.name = newName;
      await kv.set(["tasks", id], task);
      return task;
    }
    return null;
  },

  // Odhaczanie
  async toggle(id: string): Promise<Task | null> {
    const res = await kv.get(["tasks", id]);
    const task = res.value as Task | null;

    if (task) {
      task.completed = !task.completed;
      await kv.set(["tasks", id], task);
      return task;
    }
    return null;
  }
};