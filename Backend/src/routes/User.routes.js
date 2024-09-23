
import { Router } from "express";
import { registerUser } from "../controllers/User.controller.js";
import { upload } from "../middleware/Multer.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]
),registerUser)
export {userRouter}