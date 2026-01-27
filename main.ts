import { Application, Router } from "./deps.ts";
import { TaskRepository } from "./repository.ts";
import { TaskSchema } from "./models/schemas.ts";

const app = new Application();
const router = new Router();

// [ API ]

router
// Pobieranie listy wszystkich wypieków
  .get("/tasks", async (ctx) => {
    ctx.response.body = await TaskRepository.getAll();
  })


  // Dodawanie nowego zamówienia z walidacją "formularza"
  .post("/tasks", async (ctx) => {
    try {
      const body = ctx.request.body();
      const value = await body.value;
      const result = TaskSchema.safeParse(value);

      if (!result.success) {
        ctx.response.status = 400;
        ctx.response.body = { 
          message: "Błąd w zamówieniu!", 
          details: result.error.format() 
        };
        return;
      }

      const newTask = await TaskRepository.save(result.data.name);
      ctx.response.status = 201;
      ctx.response.body = newTask;
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = { message: "Błąd serwera", error: err.message };
    }
  })

  // Usuwanie wypieku po jego ID
  .delete("/tasks/:id", async (ctx) => {
    await TaskRepository.delete(ctx.params.id);
    ctx.response.body = { message: "Zamówienie usunięte z systemu!" };
  })

  // Edycja nazwy istniejącego wypieku
  .put("/tasks/:id", async (ctx) => {
    const { id } = ctx.params;
    const body = ctx.request.body();
    const { name } = await body.value;

    const result = TaskSchema.safeParse({ name });
    if (!result.success) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Błędna nazwa!" };
      return;
    }

    const updatedTask = await TaskRepository.update(id, result.data.name);
    if (updatedTask) {
      ctx.response.body = updatedTask;
    } else {
      ctx.response.status = 404;
    }
  })

  // Zmiana statusu (gotowe/do zrobienia) - tzw. "odhaczanie"
  .patch("/tasks/:id/toggle", async (ctx) => {
    const { id } = ctx.params;
    const updatedTask = await TaskRepository.toggle(id);
    
    if (updatedTask) {
      ctx.response.body = updatedTask;
    } else {
      ctx.response.status = 404;
    }
  });

// [Serwowanie strony głównej]

// Wysyłanie głównego pliku HTML do przeglądarki
router.get("/", async (ctx) => {
  await ctx.send({
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

// Rejestracja tras
app.use(router.routes());
app.use(router.allowedMethods());

// Obsługa plików statycznych typu css/js
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/public`,
    });
  } catch {
    await next();
  }
});

// Ładny komunikat przy uruchamianiu serwera :)
console.log("🍰 System cukierni działa na: http://localhost:8000");
await app.listen({ port: 8000 });