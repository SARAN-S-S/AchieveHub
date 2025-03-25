const router = require("express").Router();
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login
router.post("/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload.email.endsWith("@bitsathy.ac.in")) {
      return res.status(403).json("Only @bitsathy.ac.in emails are allowed.");
    }
    let user = await User.findOne({ email: payload.email });
    if (!user) {

      // Extract username from email (before '.')
      let username = payload.email.split(".")[0];

      // Convert the first letter to uppercase and keep the rest lowercase
      username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

      user = new User({
        username: username,
        email: payload.email,
        role: "student",
      });
      await user.save();
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Admin Signup (For predefined admins)
router.post("/admin-login", async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Check if the admin is already in the database
    let user = await User.findOne({ email, role: "admin" });

    // If the user doesn't exist, create a new admin
    if (!user) {
      user = new User({
        email,
        password,
        username,
        role: "admin", // Set role as 'admin'
      });
      await user.save(); // Save the new admin user
    }

    // If admin exists or is created, return the user details
    res.status(200).json(user);

  } catch (err) {
    res.status(500).json(err); // Send error if anything goes wrong
  }
});


module.exports = router;