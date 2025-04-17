const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");

async function uploadVideo(fileData) {
  if (!fileData) return { result: false, reason: "No file provided." };
  try {
    const tmpPath = `./tmp/${uniqid()}.mp4`;
    const errorMove = await fileData.mv(tmpPath);
    if (errorMove) {
      return {
        result: false,
        reason: "Something went wrong during file upload.",
        error: errorMove,
      };
    }
    const resultCloudinary = await cloudinary.uploader.upload(tmpPath, {
      resource_type: "video",
    });
    fs.unlinkSync(tmpPath);
    return {
      result: true,
      url: resultCloudinary.secure_url,
    };
  } catch (error) {
    return {
      result: false,
      error,
    };
  }
}

async function uploadImage(fileData) {
  if (!fileData) return { result: false, reason: "No file provided." };
  try {
    const tmpPath = `./tmp/${uniqid()}.jpg`;
    const errorMove = await fileData.mv(tmpPath);
    if (errorMove) {
      return {
        result: false,
        reason: "Something went wrong during file upload.",
        error: errorMove,
      };
    }
    const resultCloudinary = await cloudinary.uploader.upload(tmpPath);
    fs.unlinkSync(tmpPath);
    return {
      result: true,
      url: resultCloudinary.secure_url,
    };
  } catch (error) {
    return {
      result: false,
      error,
    };
  }
}

module.exports = { uploadVideo, uploadImage };
