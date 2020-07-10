const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

router.post("/user/sign_up", async (req, res) => {
  try {
    const isUserExist = await User.findOne({ email: req.fields.email });
    if (isUserExist) {
      res.json({ message: "User already exists" });
    } else {
      if (
        req.fields.email &&
        req.fields.password &&
        req.fields.account.username
      ) {
        let username = req.fields.account.username;
        const salt = uid2(16);
        const hash = SHA256(req.fields.password + salt).toString(encBase64);
        const token = uid2(16);

        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.account.username,
            phone: req.fields.account.phone,
          },
          hash: hash,
          token: token,
          salt: salt,
        });
        await newUser.save();
        res.json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
          },
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/log_in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const hash = SHA256(req.fields.password + user.salt).toString(encBase64);
      if (user.hash === hash) {
        res.json({
          _id: user._id,
          token: user.token,
          account: {
            username: user.account.username,
            phone: user.account.phone,
          },
        });
      } else {
        res.json({ message: "Sorry, you cannot connect " });
      }
    } else {
      res.json({ message: "The user doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
