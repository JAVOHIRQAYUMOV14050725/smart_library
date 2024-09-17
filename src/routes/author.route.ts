import { AuthorController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const authorRouter = Router()


authorRouter.get("/getAll",authMiddleware, checkRole(Role.LIBRARIAN), AuthorController.getAllAuthors);
authorRouter.get("/get/:id",authMiddleware, checkRole(Role.LIBRARIAN), AuthorController.getAuthorById);
authorRouter.post("/create",authMiddleware, checkRole(Role.LIBRARIAN), AuthorController.createAuthor);
authorRouter.patch("/update/:id",authMiddleware, checkRole(Role.LIBRARIAN), AuthorController.updateAuthor);
authorRouter.delete("/delete/:id",authMiddleware, checkRole(Role.LIBRARIAN), AuthorController.deleteAuthor);






export {authorRouter}