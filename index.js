const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const app = express();
app.use(formidableMiddleware());
app.use(cors());

require("./models/User");
require("./models/Offer");

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
