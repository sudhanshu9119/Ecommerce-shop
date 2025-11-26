const AuraPost = require("../../models/aura/AuraPostModal");

exports.getFeed = async (req, res, next) => {
  const posts = await AuraPost.find()
    .populate("user", "username email")
    .sort({ createdAt: -1 });

  const result = posts.map(p => ({
    id: p._id,
    title: p.title,
    description: p.description,
    user: p.user,
    thumbnailUrl: `aura/thumbnail/${p.thumbnailId}`,
    videoUrl: `aura/video/${p.videoId}`,
    createdAt: p.createdAt
  }));

  res.json(result);
};
