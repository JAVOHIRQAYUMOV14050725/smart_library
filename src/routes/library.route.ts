import {  LibraryController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const libraryRouter = Router()


libraryRouter.get("/getAll",authMiddleware, checkRole(Role.ADMIN), LibraryController.getAllLibraries);
libraryRouter.post("/create",authMiddleware, checkRole(Role.ADMIN), LibraryController.createLibrary);
libraryRouter.patch("/update/:id",authMiddleware, checkRole(Role.ADMIN), LibraryController.updateLibrary);
libraryRouter.delete("/delete/:id",authMiddleware, checkRole(Role.ADMIN), LibraryController.deleteLibrary);






export {libraryRouter}