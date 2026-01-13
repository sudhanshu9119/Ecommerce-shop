const express = require("express");
const router = express.Router();

const uploadController = require("../../controllers/aura/uploadController");
const mediaController = require("../../controllers/aura/mediaController");
const feedController = require("../../controllers/aura/feedController");

router.post("/upload", uploadController.uploadMedia);
router.get("/video/:id", mediaController.streamVideo);
router.get("/thumbnail/:id", mediaController.streamThumbnail);
router.get("/avatar/:id", mediaController.streamThumbnail);
router.get("/feed", feedController.getFeed);
// router.put("/update-avatar",   authController.updateAvatar);


module.exports = router;
