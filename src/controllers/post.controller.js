import mongoose, {isValidObjectId} from "mongoose";
import {Post} from "../models/post.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filters = {};
    if (query) {
        filters.textfield = { $regex: query, $options: 'i' };
    }
    if (userId) {
        filters.owner = userId;
    }

    const posts = await Post.find(filters)
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalPosts = await Post.countDocuments(filters);

    return res.status(200).json(new ApiResponse(200, { posts, totalPosts }, "Posts fetched successfully"));
});

const publishAPost = asyncHandler(async (req, res) => {
    const { textfield, hashtags } = req.body;
    const userId = req.user?._id;
    const imageLocalPath = req.files?.image[0]?.path;
    let image = "";

    if(imageLocalPath){
        image = await uploadOnCloudinary(imageLocalPath);
    }
    if(!image){
        throw new ApiError(400, "Image failed to upload");      
    }

    const hashtagsArray = hashtags.split(' ');

    const post = await Post.create({
        textfield,
        image: image.url || "",
        owner: userId,
        hashtags: hashtagsArray,
    });

    if(!post){
        throw new ApiError(500, "Something went wrong while posting");
    }

    return res.status(201).json(
        new ApiResponse(200, post, "posted successfully")
    );
});

const getPostById = asyncHandler(async (req, res) => {
    const { postID } = req.params;

    if (!isValidObjectId(postID)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postID).populate('owner', 'username');

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
    const { textfield, hashtags, postID } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const hashtagsArray = hashtags.split(' ');

    let post;
    const postData = await Post.findById(postID);

    if (!postData) {
        throw new ApiError(404, "Post not found");
    }

    if (userId.toString() === postData.owner.toString()) {
        post = await Post.findByIdAndUpdate(
            postID,
            {
                $set: {
                    textfield: textfield,
                    hashtags: hashtagsArray
                }
            },
            { new: true }
        );
    } else {
        throw new ApiError(403, "User not authorized to update this post");
    }

    if (!post) {
        throw new ApiError(500, "Something went wrong while updating the post");
    }

    return res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const { postID } = req.body;
    const userId = req.user?._id;

    if (!isValidObjectId(postID)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(postID);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (userId.toString() !== post.owner.toString()) {
        throw new ApiError(403, "User not authorized to delete this post");
    }

    await Post.findByIdAndDelete(postID);

    return res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

export {
    getAllPosts,
    publishAPost,
    getPostById,
    updatePost,
    deletePost,
};
