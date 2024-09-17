import { BookController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const bookRouter = Router()


bookRouter.get("/getAll",authMiddleware, checkRole(Role.LIBRARIAN), BookController.getAllBooks);
bookRouter.get("/get/:id",authMiddleware, checkRole(Role.LIBRARIAN), BookController.getBookById);
bookRouter.post("/create",authMiddleware, checkRole(Role.LIBRARIAN), BookController.createBook);
bookRouter.patch("/update/:id",authMiddleware, checkRole(Role.LIBRARIAN), BookController.getBookById);
bookRouter.delete("/delete/:id",authMiddleware, checkRole(Role.LIBRARIAN), BookController.deleteBook);






export {bookRouter}