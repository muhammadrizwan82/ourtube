import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { uploadonCloudinary, deleteFromCloudinary } from '../utils/fileuploading.js'
import jwt from 'jsonwebtoken';

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

    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, 'User loggout'));

});

const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const ispasswordCorrect = await user.isPaswordCorrect(oldPassword);

    if (!ispasswordCorrect) {
        throw new ApiError(400, 'Incorrect old password');
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'user password change successfully'));

});

const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, 'user fetch successfully'));

});

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, 'Fullname and email is required');
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        }, { new: true })
        .select('-password');
    return res
        .status(200)
        .json(new ApiResponse(200, user, 'account detail updated successfully'));

});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'avatar file is required');
    }

    const avatar = await uploadonCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, 'Error in uploading avatar file');
    }

    const existingUser = await User.findById(req.user?._id);
    if (!existingUser) {
        throw new ApiError(404, 'User not found');
    }

    const isDeletedFromCloudinart = await deleteFromCloudinary(existingUser.avatar);
    if (!isDeletedFromCloudinart) {
        throw new ApiError(500, 'Error in updating avatar file');
    }

    existingUser.avatar = avatar.url;
    existingUser.save({ validateBeforeSave: false });


    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, { new: true })
        .select('-password');

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'avatar updated successfully'));

});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'cover Image is required');
    }

    const coverImage = await uploadonCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, 'Error in uploading coverImage file');
    }
    const existingUser = await User.findById(req.user?._id);

    if (!existingUser) {
        throw new ApiError(404, 'User not found');
    }
    if (existingUser.coverImage) {
        const isDeleteFromCloudinary = await deleteFromCloudinary(existingUser?.coverImage);
        if (!isDeleteFromCloudinary) {
            throw new ApiError(500, 'Error in deleting coverImage file');
        }
    }
    existingUser.coverImage = coverImage.url;
    existingUser.save({ validateBeforeSave: false });

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, { new: true })
        .select('-password');
    return res
        .status(200)
        .json(new ApiResponse(200, user, 'coverImage updated successfully'));

});

const refreshAccessToken = asyncHandler(async (req, res) => {


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'unauthorize request')
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError('401', 'Invalid refresh token');
        }

        if (!decodedToken?._id) {
            throw new ApiError('401', 'Invalid refresh token or _id');
        }

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError('401', 'Invalid refresh token or user');
        }

        if (user.refreshToken != incomingRefreshToken) {
            throw new ApiError('401', 'Refresh token expired or used');
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        console.log('accessToken', accessToken)
        console.log('refreshToken', refreshToken)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, 'access token refreshed'));
    } catch (error) {
        throw new ApiError(401, error?.message || 'invalid refresh token');
    }
});

const getUserChannelprofile = asyncHandler(async (req, res) => {

    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, 'username is missing');
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: '$subscribers' },
                subscribedToCount: { $size: '$subscribedTo' }
            }
        },
        {
            isSubscribed: {
                $cond: {
                    if: {
                        $in: [req.user._id, '$subscribers.subscriber']
                    },
                    then: true,
                    else: false
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])

    if (!channel?.length) {
        throw new ApiError(404, 'channel does not exist');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], 'channel profile fetched successfully'));
});

const getUserWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [{
                                $project: {
                                    fullName: 1,
                                    email: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, 'watch history fetched successfully'));
});


export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changePassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelprofile, getUserWatchHistory };