import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: [true,'category already exists']
        },
        isActive: {
            type:Boolean,
            default: true // Setting a default value for isActive
        },
    },
    { timestamps: true }
);

 

export const Category = mongoose.model('Category', categorySchema);
