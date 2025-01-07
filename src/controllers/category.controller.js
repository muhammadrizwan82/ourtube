import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Category } from '../models/category.model.js'

const getAllCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find({ isActive: true });
    res.status(200).json(new ApiResponse(200, categories, 'category list'));
});

const addCategory = asyncHandler(async (req, res) => {

    const { title } = req.body;
    if (!title) {
        throw new ApiError(400, 'category title is required');
    }

    //Convert the input title to lowercase for consistency
    const lowerCaseTitle = title.toLowerCase();

    // Perform a case-insensitive search in the database
    const existedCategory = await Category.findOne({
        title: { $regex: new RegExp(`^${lowerCaseTitle}$`, 'i') }
    });

    if (existedCategory) {
        throw new ApiError(400, 'category already exists');
    }
    const insertedCategory = await Category.create({
        title: title
    });
    res.status(201).json(new ApiResponse(200, insertedCategory, 'category created'))
});

export { getAllCategories, addCategory };