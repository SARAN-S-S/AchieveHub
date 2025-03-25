const router = require("express").Router();
const User = require("../models/User");  
const Post = require("../models/Post");
const express = require("express"); 

// Update User
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
      if (req.body.password) {
        req.body.password = req.body.password;
      }
      try {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedUser);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your account!");
    }
  });

//DELETE
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id) {
    
         try {
      const user = await User.findById(req.params.id);
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(401).json("Unauthorized");
    }
});

//GET USER
router.get("/:id", async (req, res) => {
    try  {
        const user = await User.findById(req.params.id);
        const { password, ...others} = user._doc;
        res.status(200).json(others);
    }  catch(err)  {
        res.status(500).json(err);
    }
})


// Get list of users with pagination and search
router.get("/", async (req, res) => {
  const { page = 1, search = "" } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const query = {
      role: "student",
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const users = await User.find(query)
      .select("username email postCount")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({ users, totalPages });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;

