const router = require("express").Router();
const Comment = require("../models/Comment");
const User = require("../models/User"); // Import the User model

// CREATE a comment (handles both regular comments and replies)
router.post("/", async (req, res) => {
  try {
    const { postId, userId, username, text, parentCommentId } = req.body;

    let actualParentCommentId = parentCommentId;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.parentCommentId) {
        actualParentCommentId = parentComment.parentCommentId;
      }
    }

    const newComment = new Comment({
      postId,
      userId,
      username,
      text,
      parentCommentId: actualParentCommentId || null,
    });

    const savedComment = await newComment.save();

    if (actualParentCommentId) {
      await Comment.findByIdAndUpdate(actualParentCommentId, {
        $push: { replies: savedComment._id },
      });
    }

    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET comments for a post (including replies)
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId, parentCommentId: null })
      .sort({ createdAt: -1 })
      .populate({
        path: "replies",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "replies",
          options: { sort: { createdAt: -1 } },
          populate: { path: "replies" },
        },
      });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a comment (Allow admin to delete any comment)
router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json("Comment not found");
    }

    // Check if the user is the author or an admin
    const user = await User.findById(req.body.userId); // Use findById instead of findOne
    if (!user) {
      return res.status(404).json("User not found");
    }

    if (comment.userId === req.body.userId || user.role === "admin") {
      await comment.deleteOne();
      res.status(200).json("Comment has been deleted...");
    } else {
      res.status(403).json("You can delete only your comments!");
    }
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json("Server error");
  }
});

// UPDATE a comment (Allow admin to update any comment)
router.put("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json("Comment not found");
    }

    // Check if the user is the author or an admin
    const user = await User.findById(req.body.userId); // Use findById instead of findOne
    if (!user) {
      return res.status(404).json("User not found");
    }

    if (comment.userId === req.body.userId || user.role === "admin") {
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        { text: req.body.text },
        { new: true }
      );
      res.status(200).json(updatedComment);
    } else {
      res.status(403).json("You can update only your comments!");
    }
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json("Server error");
  }
});

module.exports = router;