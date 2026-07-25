import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, userId} = req.body    

    if (!name || !description || !userId) {
        throw new ApiError(400, "Name, description, and userId are required")
    }   

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }               

    const playlist = new Playlist({
        name,
        description,
        userId: new mongoose.Types.ObjectId(userId),
    })

    await playlist.save()

    return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist))
})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const playlists = await Playlist.find({ userId: new mongoose.Types.ObjectId(userId) })

    return res
    .status(200)
    .json(new ApiResponse(200, "User playlists fetched successfully", playlists))
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.body

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }   

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }       

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist")
    }   

    playlist.videos.push(videoId)
    
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, "Video added to playlist successfully", playlist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.body

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }       

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in the playlist")
    }   

    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId.toString())

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, "Video removed from playlist successfully", playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (name) {
        playlist.name = name
    }   

    if (description) {
        playlist.description = description
    }

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist))
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}