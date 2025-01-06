import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadonCloudinary } from '../utils/fileuploading.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        console.log(existedUser._id)
        throw new ApiError(409, "username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar file is rquired");
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);
    const coverImage = await uploadonCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Error in uploading avatar file");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()

    })

    const newUser = await User.findById(user._id).select(
        "-password -refreshToken -password"
    )
    if (!newUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    res.status(201).json(new ApiResponse(200, newUser, 'User register successfully'))
});

export { registerUser };