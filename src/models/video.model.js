import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            camelcase: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        duration: {
            type: Number,
            required: true,
            default: 0
        },
        videoUrl: {
            type: String,
            required: true
        },
        videoThumbnailUrl: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isActive: Boolean,
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model('Video', videoSchema);
