import express from "express";
import { todoController } from "../controllers/todo.controller.js";
import { authToken } from "../middlewares/auth.middleware.js";
import { isTodoOwner } from "../middlewares/todo.middleware.js";

const router = express.Router();

router.use(authToken);


router.post("/", authToken, todoController.createTodo);
router.get("/", authToken, todoController.getMyTodos);

router.get("/:todoId", authToken, todoController.getTodoById);

router.patch("/:todoId", authToken, todoController.updateTodo);

router.delete("/:todoId", authToken, todoController.deleteTodo);

export default router;