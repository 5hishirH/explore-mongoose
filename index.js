const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const mongoose = require("mongoose");

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.mongodb_uri, {
      dbName: "share_prompt",
    });
  } catch (error) {
    console.log(error);
  }
};

connectToDb();

const PromptSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  prompt: {
    type: String,
    required: [true, "Prompt is required."],
  },
  tag: {
    type: String,
    required: [true, "Tag is required."],
  },
});

const Prompt = new mongoose.model("Prompt", PromptSchema);

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  username: {
    type: String,
    required: [true, "Username is required!"],
    match: [
      /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      "Username invalid, it should contain 8-20 alphanumeric letters and be unique!",
    ],
  },
  image: {
    type: String,
  },
});

const User = new mongoose.model("User", UserSchema);

app.get("/prompts", async (req, res) => {
  const prompts = await Prompt.find({});
  res.send(prompts);
});

app.get("/users", async (req, res) => {
  const { email } = req.query;
  const { _id } = await User.findOne({ email: email });
  const prompts = await Prompt.find({ creator: _id });
  res.send(prompts);
});
