
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { cloudnaryUpload } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
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

export {registerUser}