const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    if (file.mimetype.startsWith("video/")) {
      return { bucketName: "videos", filename: `video-${Date.now()}` };
    }
    if (file.mimetype.startsWith("image/")) {
      return { bucketName: "thumbnails", filename: `thumb-${Date.now()}` };
    }
  }
});

module.exports = storage;
