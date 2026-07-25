import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {userId} = req.body

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }   

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const existingSubscription = await Subscription.findOne({ user: userId })

    if (existingSubscription) {
        await existingSubscription.remove()
        return res.status(200).json(new ApiResponse(true, "Subscription removed successfully"))
    }

    const newSubscription = new Subscription({ user: userId })
    await newSubscription.save()
    return res
    .status(201)
    .json(new ApiResponse(true, "Subscription added successfully"))
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }               

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }   

    const subscriberCount = await Subscription.countDocuments({ user: userId })

    return res.status(200).json(new ApiResponse(true, "Subscriber count fetched successfully", { subscriberCount }))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {

    const {userId} = req.params 

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const subscriptions = await Subscription.find({ user: userId }).populate("channel", "name email")

    return res.status(200).json(new ApiResponse(true, "Subscribed channels fetched successfully", { subscriptions }))
})

export {
    toggleSubscription, 
    getUserChannelSubscribers, 
    getSubscribedChannels
}
