//https://www.youtube.com/watch?v=8k-kK3tsJFY&t=159s
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
        throw new ApiError(401, 'Unauthorize request')
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await User.findById(decodedToken._id);
});