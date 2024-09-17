import {  BranchController } from "@controllers";
import { Role } from "@enums";
import { authMiddleware, checkRole } from "@middlewares";
import { Router } from "express";

const branchRouter = Router()


branchRouter.get("/getAll",authMiddleware, checkRole(Role.ADMIN), BranchController.getAllBranches);
branchRouter.post("/create",authMiddleware, checkRole(Role.ADMIN), BranchController.createBranches);
branchRouter.patch("/update/:id",authMiddleware, checkRole(Role.ADMIN), BranchController.updateBranch);
branchRouter.delete("/delete/:id",authMiddleware, checkRole(Role.ADMIN), BranchController.deleteBranch);






export {branchRouter}