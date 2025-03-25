const  router = require("express").Router();
const User = require("../models/User");  
const Post = require("../models/Post");  
const express = require("express");



// CREATE POST

router.post("/", async (req, res) => {
  try {
      const newPost = new Post(req.body);
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
  } catch (err) {
      console.error("Error saving post:", err);
      res.status(500).json({ message: "Failed to create post" });
  }
});


// UPDATE POST (Allow admin to update any post)
router.put("/:id", async (req, res) => {
  
  try {
      
      const post = await Post.findById(req.params.id);
      if (!post) {
          return res.status(404).json("Post not found");
      }

      const user = await User.findOne({ username: req.body.username });
      if (!user) {
          return res.status(404).json("User not found");
      }

      if (post.username === req.body.username || user.role === "admin") {
          const updateObject = {
              title: req.body.title,
              desc: req.body.desc,
              tags: [req.body.category, req.body.year, req.body.category2].filter(Boolean),
              photo: req.body.photo || post.photo,
          };

          if (req.body.video !== undefined) {
            updateObject.video = req.body.video; // This will handle both string and null cases.
        }

          const updatedPost = await Post.findByIdAndUpdate(
              req.params.id,
              { $set: updateObject },
              { new: true, writeConcern: { w: 'majority' } }
          );

         
          const verifiedPost = await Post.findById(req.params.id);
          

          res.status(200).json(updatedPost);
      } else {
          res.status(401).json("You can update only your posts!");
      }
  } catch (err) {
      console.error("Error updating post:", err);
      res.status(500).json({ message: "Failed to update post" });
  }
});

// DELETE POST (Allow admin to delete any post)
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if the user is the author or an admin
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json("User not found");
    }

    if (post.username === req.body.username || user.role === "admin") {
      try {
        await post.deleteOne();
        res.status(200).json("Post has been deleted...");
      } catch (err) {
        res.status(500).json("Error deleting post");
      }
    } else {
      res.status(401).json("You can delete only your posts!");
    }
  } catch (err) {
    res.status(500).json("Server error");
  }
});


// Fetch posts by the logged-in user
router.get("/my-posts", async (req, res) => {
  const { username, page = 1, limit = 10, search = "" } = req.query;
  try {
    const query = { username };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Post.countDocuments(query);
    res.status(200).json({ posts, total });
  } catch (err) {
    res.status(500).json(err);
  }
});



// Fetch pending posts (with pagination)
router.get("/pending", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    // Fetch posts with pagination
    const posts = await Post.find({ status: "pending" })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch user details for each post
    const postsWithEmail = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ username: post.username });
        return {
          ...post._doc, // Spread the post details
          email: user ? user.email : "N/A", // Add the email field
        };
      })
    );

    const total = await Post.countDocuments({ status: "pending" });
    res.status(200).json({ posts: postsWithEmail, total });
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET POST
router.get("/:id", async (req, res) => {
    try  {
        const post = await Post.findById(req.params.id);
        
        res.status(200).json(post);
    }  catch(err)  {
        res.status(500).json(err);
    }
})



// GET ALL POSTS (with optional tag filtering)
router.get("/", async (req, res) => {
  const { category, year, search, user: username, tag } = req.query;

  try {
    let posts;

    if (search) {
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            status: "approved",
            $or: [
              { title: { $regex: search, $options: "i" } },
              { username: { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },
            ],
          },
        },
        {
          $addFields: { email: "$user.email" },
        },
        { $sort: { createdAt: -1 } } // Sort by newest first
      ]);
    } else if (username) {
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { status: "approved", username },
        },
        {
          $addFields: { email: "$user.email" },
        },
        { $sort: { createdAt: -1 } } // Sort by newest first
      ]);
    } else if (tag) {
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { status: "approved", tags: tag },
        },
        {
          $addFields: { email: "$user.email" },
        },
        { $sort: { createdAt: -1 } } // Sort by newest first
      ]);
    } else if (category && year) {
      posts = await Post.find({ 
        status: "approved", 
        tags: { $all: [category, year] } 
      }).sort({ createdAt: -1 }); // Sort by newest first
    } else if (category) {
      posts = await Post.find({ 
        status: "approved", 
        tags: category 
      }).sort({ createdAt: -1 }); // Sort by newest first
    } else if (year) {
      posts = await Post.find({ 
        status: "approved", 
        tags: year 
      }).sort({ createdAt: -1 }); // Sort by newest first
    } else {
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { status: "approved" },
        },
        {
          $addFields: { email: "$user.email" },
        },
        { $sort: { createdAt: -1 } } // Sort by newest first
      ]);
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

  
//like a post
  router.post("/:id/like", async (req, res) => {
    try {
      const postId = req.params.id;
  
      // Find the post and increment likes
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } }, // Increment likes by 1
        { new: true } // Return the updated document
      );
  
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      res.json({ message: "Post liked", likes: updatedPost.likes });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// UNLIKE POST with safeguard
router.post("/:id/unlike", async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const updatedLikes = Math.max(post.likes - 1, 0);
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { likes: updatedLikes },
            { new: true }
        );

        res.json({ message: "Post unliked", likes: updatedPost.likes });
    } catch (error) {
        console.error("Error unliking post:", error);
        res.status(500).json({ message: "Server error" });
    }
});





// Bulk delete posts
router.post("/bulk-delete", async (req, res) => {
  const { postIds } = req.body;
  try {
    await Post.deleteMany({ _id: { $in: postIds } });
    res.status(200).json("Posts deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});



// Approve a post
router.put("/approve/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});





// Reject a post
router.put("/reject/:id", async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json("Reason for rejection is required.");
  }
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Edit a post (admin can edit before approval)
router.put("/edit/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if req.body has at least one valid field
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json("No fields to update.");
    }

    // Create a dynamic update object with only defined and non-empty values
    const updateObject = Object.keys(req.body).reduce((acc, key) => {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Handle the video field separately
    if (req.body.video !== undefined) {
      updateObject.video = req.body.video; // This will handle both string and null cases.
    }

    if (Object.keys(updateObject).length === 0) {
      return res.status(400).json("No valid fields to update.");
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateObject },
      { new: true, runValidators: true }  // runValidators ensures schema validation during update
    );

    if (!updatedPost) {
      return res.status(500).json("Failed to update the post.");
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err.message);  // Log error message for debugging
    res.status(500).json("Server error. Please try again later.");
  }
});


// Track post view
router.post("/:id/view", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has already viewed this post
    const alreadyViewed = post.viewedBy.some(viewerId => 
      viewerId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      // Increment view count and add user to viewedBy array
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { viewCount: 1 },
          $addToSet: { viewedBy: userId }
        },
        { new: true }
      );
      
      return res.status(200).json(updatedPost);
    }

    res.status(200).json(post);
  } catch (err) {
    console.error("Error tracking post view:", err);
    res.status(500).json({ message: "Failed to track post view" });
  }
});



module.exports = router;
