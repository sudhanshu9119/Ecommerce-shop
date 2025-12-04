const multer = require("multer");
const storage = require("../../config/gridfs");
const AuraPost = require("../../models/aura/AuraPostModal");

const upload = multer({ storage });

exports.uploadMedia = [
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),

  async (req, res) => {
    try {
      const { title, description, userId } = req.body;

      if (!req.files.video || !req.files.thumbnail) {
        return res.status(400).json({ message: "Video and Thumbnail required" });
      }

      const videoFile = req.files.video[0];
      const thumbFile = req.files.thumbnail[0];

      const newPost = await AuraPost.create({
        user: userId,
        title,
        description,
        videoId: videoFile.id,
        thumbnailId: thumbFile.id,
      });

      res.status(201).json({
        message: "Post created successfully",
        post: newPost,
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
];


const uploadAvtar = ()=> {
  
}