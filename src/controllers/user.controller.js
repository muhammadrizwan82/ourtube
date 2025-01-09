import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadonCloudinary } from '../utils/fileuploading.js'

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

    let avatarLocalPath;
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avtar file is rquired");
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadonCloudinary(coverImageLocalPath);
    }
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

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if ([username || email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "username or email & password is required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
        $and: [{ isActive: true }]
    })

    if (!existedUser) {
        throw new ApiError(409, "username or email not exist");
    }

    const isPasswordCorrect = await existedUser.isPaswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id);

    if (!accessToken) {
        throw new ApiError(500, "Something went wrong, while generating access token ");
    }

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }));
});

const logoutUser = asyncHandler(async (req, res) => {


});

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const existedUser = await User.findById(userId);
        const accessToken = await existedUser.generateAccessToken();
        const refreshToken = await existedUser.generateRefreshToken();

        existedUser.refreshToken = refreshToken;
        existedUser.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong, while generating refresh and accesstoken");

    }
}

export { registerUser, loginUser };