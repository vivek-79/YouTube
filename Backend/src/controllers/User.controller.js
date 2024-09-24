
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { cloudnaryUpload } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async(req,res)=>{
    
    const {userName,email,fullName,password} =req.body

    //empty check
    if(
        [userName,email,fullName,password].some((field)=>
        field?.trim()==="")
    )
    throw new ApiError(400,"All fields are compulsory")

    //existing check
    const exist = await User.findOne({
        $or:[{email},{userName}]
    })
    if(exist) {
        throw new ApiError(409,"User Already Exist")
    }

    //check for avtar and coverImage
    const avtarLocalFilePath = req.files?.avatar[0]?.path
   let coverImageLocalFilePath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverImageLocalFilePath =req.files.coverImage[0].path
   }

    if(!avtarLocalFilePath){
        throw new ApiError(400,"Avtar Is Path Required")
    }
    const avtar = await cloudnaryUpload(avtarLocalFilePath)
    if(!avtar){
        throw new ApiError(400,"Avtar Is Required")
    }

    const coverImg = await cloudnaryUpload(coverImageLocalFilePath)
    const user= await User.create({
        fullName,
        userName:userName.toLowerCase(),
        email,
        avatar:avtar.url,
        coverImage:coverImg?.url || "",
        password
    })

    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Error Account Not Created")
    }
    return res.status(201).json(
        new ApiResponse (200,createdUser,"User Registered Successfuly")
    )
})

const  generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(501,"Tokens not generated")
    }
}

const loginUser = asyncHandler(async(req,res)=>{
    const {userName,email,password} =req.body

    if(!email){
        throw new ApiError(402,"Email is required")
    }

    const user = await User.findOne({
        $or:[{email},{userName}]
    }
    )
    if(!user){
        throw new ApiError(403,"user Not Registered")
    }
    const isPasswordCorrect =await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(408,"Password is Wrong")
    }

    const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)

    const findUser =await  User.findById(user._id)
    .select("-password -refreshToken")

    const options ={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
               user:findUser,accessToken,refreshToken 
            },
            "User Logged In Successfully"
        )
    )

})

const logOut = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"Logged Out Successfully")
    )
})

const newRefreshTokens = asyncHandler(async(req,res)=>{
   try {
     const incomingRefreshToken =req.body?.refreshToken || req.cookies.refreshToken
 
     if(!incomingRefreshToken){
         throw new ApiError(404,"Unauthorized Access")
     }
 
     const verifyToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SERET)
 
     if(!verifyToken){
         throw new ApiError(405,"Unauthorized Access or Token Expired")
     }
 
     const user =await User.findById(verifyToken._id)
 
     const options={
         httpOnly:true,
         secure:true
     }
 
     const {refreshToken,accessToken} =await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
         new ApiResponse(
             200,
             {
                accessToken,refreshToken
             },
             "Access Token Refreshed"
            )
        )
    } 
    catch (error) {
    throw new ApiError(401,error?.message || "Invalid Token")
   }

})

export {registerUser,loginUser,logOut,newRefreshTokens}