const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

cloudinary.config({
  cloud_name: "drl1bh3pd",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    let pictureToUpload = req.files.picture.path;
    const photo = await cloudinary.uploader.upload(pictureToUpload);
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      picture: photo,
      user: req.user._id,
      created: new Date(),
    });
    await newOffer.save();
    res.json({
      created: newOffer.created,
      creator: { account: req.user.account, _id: req.user._id },
      description: req.fields.description,
      picture: photo,
      price: req.fields.price,
      title: req.fields.title,
      _id: newOffer.id,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.id) {
      const offer = await Offer.findById(req.fields.id);
      await offer.deleteOne();
      res.json({ message: "Offer removed" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/offer/update", async (req, res) => {
  try {
    if (req.fields.id && req.fields.description) {
      const offer = await Offer.findById(req.fields.id);
      offer.description = req.fields.description;
      await offer.save();
      res.json(offer);
    } else if (req.fields.id && req.fields.price) {
      const offer = await Offer.findById(req.fields.id);
      offer.price = req.fields.price;
      await offer.save();
      res.json(offer);
    } else if (req.fields.id && req.fields.title) {
      const offer = await Offer.findById(req.fields.id);
      offer.title = req.fields.title;
      await offer.save();
      res.json(offer);
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/with-count", async (req, res) => {
  try {
    let object = {};
    if (req.query.priceMin) {
      object.price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (object.price) {
        object.price = { $gte: req.query.priceMin, $lte: req.query.priceMax };
      } else {
        object.price = { $lte: req.query.priceMax };
      }
    }
    if (req.query.title) {
      object.title = new RegExp(req.query.title, "i");
    }
    let skip;
    let limit = 8;

    if (!req.query.page || req.query.page === "0" || req.query.page === "1") {
      skip = 0;
    } else {
      skip = limit * req.query.page - limit;
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort.price = "desc";
    } else if (req.query.sort === "price-asc") {
      sort.price = "asc";
    } else if (req.query.sort === "date-asc") {
      sort.created = "asc";
    } else if (req.query.sort === "date-desc") {
      sort.created = "desc";
    }
    const offers = await Offer.find(object).sort(sort);
    let counter = 0;
    for (let i = 0; i < offers.length; i++) {
      counter++;
    }
    const newOffers = await Offer.find(object)
      .limit(limit)
      .skip(skip)
      .populate({ path: "user", select: "account.username account.phone" });

    res.json({ counter: counter, offers: newOffers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("user");
    console.log(offer);
    res.json({
      _id: offer.id,
      title: offer.title,
      description: offer.description,
      price: offer.price,
      picture: offer.picture,
      creator: { account: offer.user.account, _id: offer.user._id },
      created: offer.created,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
