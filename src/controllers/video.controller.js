import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {}
    
    if (query) {
        filter.title = { $regex: query, $options: "i" }
    };
    
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        filter.userId = userId
    }

    const sortOptions = {}
    
    if (sortBy) {
        const sortField = sortBy
        const sortOrder = sortType === "desc" ? -1 : 1
        sortOptions[sortField] = sortOrder
    }

    const pageNumber = parseInt(page)
    const pageSize = parseInt(limit)
    const skip = (pageNumber - 1) * pageSize

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)

    const totalVideos = await Video.countDocuments(filter)

    const totalPages = Math.ceil(totalVideos / pageSize)

    return res
    .status(200)
    .json(new ApiResponse(200, { videos, totalVideos, totalPages }, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    let videoFileUrl, thumbnailUrl

    if (req.files && req.files.videoFile) {
        const videoFile = req.files.videoFile[0]
        const videoUploadResult = await uploadOnCloudinary(videoFile.path, "video")
        videoFileUrl = videoUploadResult.secure_url
    }

    console.log("videoFileUrl", videoFileUrl)
    
    console.log("thumbnailUrl", thumbnailUrl)

    if (!videoFileUrl) {
        console.log("videoFileUrl", videoFileUrl)
        throw new ApiError(400, "Video file is required")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFileUrl,
        thumbnail: thumbnailUrl,
        owner: req.user._id
    })

    if (!video) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }   

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}