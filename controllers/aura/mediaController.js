const mongoose = require("mongoose");

const getBucket = (bucket) =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: bucket });

const getFile = (bucket, id) =>
  mongoose.connection.db
    .collection(`${bucket}.files`)
    .findOne({ _id: new mongoose.Types.ObjectId(id) });

// 📌 Serve Video
exports.streamVideo = async (req, res) => {
  try {
    const file = await getFile("videos", req.params.id);
    if (!file) return res.sendStatus(404);

    res.set("Content-Type", file.contentType);

    getBucket("videos")
      .openDownloadStream(file._id)
      .pipe(res);
  } catch (err) {
    res.sendStatus(500);
  }
};

// 📌 Serve Thumbnail
exports.streamThumbnail = async (req, res) => {
  try {
    const file = await getFile("thumbnails", req.params.id);
    if (!file) return res.sendStatus(404);

    res.set("Content-Type", file.contentType);

    getBucket("thumbnails")
      .openDownloadStream(file._id)
      .pipe(res);
  } catch (err) {
    res.sendStatus(500);
  }
};
