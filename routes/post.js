const router = require("express").Router();

const Post = require("../models/Post");
const Users = require("../models/Users");

// create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json({ message: "successfully posted!", savedPost });
  } catch (error) {
    res.status(500).json(error);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await Post.findOneAndUpdate(req.params.id, { $set: req.body });
      res.status(200).json({ message: "Successfully post updated" });
    } else {
      res.status(403).json("Only owner of this post is allowed to update");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});
// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json({ message: " post successfully deleted" });
    } else {
      res.status(403).json("Only owner of this post is allowed to delete it");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
// like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post has been disliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all posts for some one you are following
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await Users.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    const timelinePost = userPosts.concat(...friendPosts);
    res.status(200).json(timelinePost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
