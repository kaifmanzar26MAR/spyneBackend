import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Follower } from "../models/follower.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleFollow = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserFollowers = asyncHandler(async (req, res) => {
    const {userId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleFollow,
    getUserFollowers,
    getSubscribedChannels
}