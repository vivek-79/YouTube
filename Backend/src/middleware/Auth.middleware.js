
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"

const verifyJWT = asyncHandler(async(req,_,next)=>{

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(404,"Unauthorized Request")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(405,"User not found")
        }
        req.user =user
        next()
    } catch (error) {
        throw new ApiError(408,error.message)
    }
})

export {verifyJWT}

