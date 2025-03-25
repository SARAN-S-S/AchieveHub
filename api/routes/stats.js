// api/routes/stats.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const moment = require("moment");

router.get("/users", async (req, res) => {
  try {
    // Count students and admins
    const students = await User.countDocuments({ role: "student" });
    const admins = await User.countDocuments({ role: "admin" });

    // Get all users with their roles
    const users = await User.find({}, "username email role").lean();

    // Get post counts for each user (approved, rejected, pending)
    const postsByUser = await Post.aggregate([
      {
        $group: {
          _id: "$username",
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    // Map users with their post counts
    const usersWithPosts = users.map((user) => {
      const userPosts = postsByUser.find((p) => p._id === user.username) || {
        approved: 0,
        rejected: 0,
        pending: 0,
      };
      return {
        ...user,
        approvedPosts: userPosts.approved,
        rejectedPosts: userPosts.rejected,
        pendingPosts: userPosts.pending,
      };
    });

    res.status(200).json({ students, admins, users: usersWithPosts });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get post statistics
router.get("/posts", async (req, res) => {
  try {
    // Count total approved posts
    const totalPosts = await Post.countDocuments({ status: "approved" });

    // Count approved posts by event type
    const postsByEventType = await Post.aggregate([
      { $match: { status: "approved" } }, // Filter by approved posts
      { $unwind: "$tags" },
      {
        $match: {
          tags: {
            $in: [
              "Project",
              "Patent",
              "Paper",
              "Journal",
              "Competition",
              "Product",
              "Placement",
            ],
          },
        },
      },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);

    // Count approved posts by student year
    const postsByYear = await Post.aggregate([
      { $match: { status: "approved" } }, // Filter by approved posts
      { $unwind: "$tags" },
      {
        $match: {
          tags: {
            $in: ["First Year", "Second Year", "Third Year", "Final Year"],
          },
        },
      },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ totalPosts, postsByEventType, postsByYear });
  } catch (err) {
    res.status(500).json(err);
  }
});


// Get monthly post statistics
router.get("/monthly-posts", async (req, res) => {
  const { month, year } = req.query;
  try {
    const matchQuery = { status: "approved" }; // Filter by approved posts
    if (month) matchQuery.$expr = { $eq: [{ $month: "$createdAt" }, parseInt(month)] };
    if (year) matchQuery.$expr = { $eq: [{ $year: "$createdAt" }, parseInt(year)] };

    const monthlyPosts = await Post.aggregate([
      { $match: matchQuery }, // Apply the filter
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalPosts = await Post.countDocuments(matchQuery);

    // If no posts exist for the selected month/year, return default data
    if (monthlyPosts.length === 0) {
      return res.status(200).json({
        posts: [{ _id: 1, count: 0, monthName: "No Data", percentage: "0.00" }],
        totalPosts: 0,
      });
    }

    const formattedMonthlyPosts = monthlyPosts.map((post) => ({
      ...post,
      monthName: moment().month(post._id - 1).format("MMMM"),
      percentage: ((post.count / totalPosts) * 100).toFixed(2),
    }));

    res.status(200).json({ posts: formattedMonthlyPosts, totalPosts });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;