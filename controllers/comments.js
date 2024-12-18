const Comment = require("../models/comment");
const Post = require("../models/post");

module.exports = (app) => {
  // CREATE Comment
  app.post("/posts/:postId/comments", async (req, res) => {
    try {
      if (req.user) {
        // INSTANTIATE INSTANCE OF MODEL
        const comment = new Comment(req.body);
        const userId = req.user._id;
        comment.author = userId;

        // SAVE INSTANCE OF Comment MODEL TO DB
        await comment.save();

        // FIND PARENT POST
        const post = await Post.findById(req.params.postId);

        // ADD COMMENT REFERENCE TO POST
        post.comments.unshift(comment);
        await post.save();

        // REDIRECT TO ROOT
        res.redirect("/");
      } else {
        return res.status(401); // UNAUTHORIZED
      }
    } catch (err) {
      console.log(err);
    }
  });
};
