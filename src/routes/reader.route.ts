import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";
import { LibrarianUserController } from "src/controllers/reader.controller";

const librarianRouter = Router()




librarianRouter.get("/getAll",authMiddleware, checkRole(Role.LIBRARIAN), LibrarianUserController.getReaders);
librarianRouter.patch("/update/:id",authMiddleware, checkRole(Role.LIBRARIAN), LibrarianUserController.updateUser);
librarianRouter.delete("/delete/:id",authMiddleware, checkRole(Role.LIBRARIAN), LibrarianUserController.deleteUser);


export {librarianRouter}