import { CategoryController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const categoryRouter = Router()


categoryRouter.get("/getAll",authMiddleware, checkRole(Role.LIBRARIAN), CategoryController.getAllCategories);
categoryRouter.get("/get/:id",authMiddleware, checkRole(Role.LIBRARIAN), CategoryController.getCategoryById);
categoryRouter.post("/create",authMiddleware, checkRole(Role.LIBRARIAN), CategoryController.createCategory);
categoryRouter.patch("/update/:id",authMiddleware, checkRole(Role.LIBRARIAN), CategoryController.updateCategory);
categoryRouter.delete("/delete/:id",authMiddleware, checkRole(Role.LIBRARIAN), CategoryController.deleteCategory);






export {categoryRouter}