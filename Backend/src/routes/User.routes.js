
import { Router } from "express";
import { registerUser,loginUser,logOut ,newRefreshTokens} from "../controllers/User.controller.js";
import { upload } from "../middleware/Multer.middleware.js";
import { verifyJWT } from "../middleware/Auth.middleware.js";

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

userRouter.route("/login").post(loginUser)

//secured route
userRouter.route("/logout").post(verifyJWT,logOut)
userRouter.route("/refresh-token").post(newRefreshTokens)
export {userRouter}