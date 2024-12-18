const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const checkAuth = require("../middleware/checkAuth");

module.exports = (app) => {
  // Apply the checkAuth middleware to all routes in this file
  app.use(checkAuth);

  // Root path
  app.get("/", async (req, res) => {
    try {
      const posts = await Post.find({}).lean().populate("author");
      const currentUser = req.user;
      return res.render("posts-index", { posts, currentUser });
    } catch (err) {
      console.log(err.message);
    }
  });

  // New Post
  app.get("/posts/new", checkAuth, (req, res) => {
    if (req.user) {
      res.render("posts-new");
    } else {
      return res.status(401).send("Unauthorized"); // UNAUTHORIZED
    }
  });

  // Create Post
  app.post("/posts/new", checkAuth, async (req, res) => {
    try {
      if (req.user) {
        const userId = req.user._id;
        const post = new Post(req.body);
        post.author = userId;
        post.upVotes = [];
        post.downVotes = [];
        post.voteScore = 0;

        await post.save();

        const user = await User.findById(userId);
        user.posts.unshift(post);
        await user.save();

        // REDIRECT TO THE NEW POST
        return res.redirect(`/posts/${post._id}`);
      } else {
        return res.status(401).send("Unauthorized");
      }
    } catch (err) {
      console.log(err.message);
    }
  });

  // Show Post
  app.get("/posts/:id", async (req, res) => {
    const currentUser = req.user;

    try {
      const post = await Post.findById(req.params.id)
        .populate("comments")
        .lean();
      return res.render("posts-show", { post, currentUser });
    } catch (err) {
      console.log(err.message);
    }
  });

  // Subreddit
  app.get("/n/:subreddit", async (req, res) => {
    const currentUser = req.user;

    try {
      const posts = await Post.find({ subreddit: req.params.subreddit }).lean();
      res.render("posts-index", { posts, currentUser });
    } catch (err) {
      console.log(err.message);
    }
  });

  app.put("/posts/:id/vote-up", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      post.upVotes.push(req.user._id);
      post.voteScore += 1;
      await post.save();
      return res.status(200);
    } catch (err) {
      console.log(err);
    }
  });

  app.put("/posts/:id/vote-down", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      post.downVotes.push(req.user._id);
      post.voteScore -= 1;
      await post.save();
      return res.status(200);
    } catch (err) {
      console.log(err);
    }
  });
};
