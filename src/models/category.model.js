import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            camelcase: true,
        },
        isActive: Boolean,
    },
    { timestamps: true }
);

export const Caetgory = mongoose.model('Caetgory', categorySchema);
