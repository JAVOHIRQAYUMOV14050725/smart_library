import { AdminUserController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const adminRouter = Router()



adminRouter.get("/getAll",authMiddleware, checkRole(Role.ADMIN), AdminUserController.getAllUsers);
adminRouter.post("/create",authMiddleware, checkRole(Role.ADMIN), AdminUserController.createUser);
adminRouter.patch("/update/:id",authMiddleware, checkRole(Role.ADMIN), AdminUserController.updateUser);
adminRouter.delete("/delete/:id",authMiddleware, checkRole(Role.ADMIN), AdminUserController.deleteUser);






export {adminRouter}