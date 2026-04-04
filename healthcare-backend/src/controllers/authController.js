const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      sleep,
      exercise,
      smoker,
      alcohol,
      diabetic,
      heart_disease,
      goal,
      diet,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      sleep,
      exercise,
      smoker,
      alcohol,
      diabetic,
      heart_disease,
      goal,
      diet,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        sleep: user.sleep,
        exercise: user.exercise,
        smoker: user.smoker,
        alcohol: user.alcohol,
        diabetic: user.diabetic,
        heart_disease: user.heart_disease,
        goal: user.goal,
        diet: user.diet,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const stringFields = ["name", "email", "gender", "goal", "diet"];
    const numberFields = [
      "age",
      "height",
      "weight",
      "sleep",
      "exercise",
      "smoker",
      "alcohol",
      "diabetic",
      "heart_disease",
    ];

    stringFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    numberFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field] === "" || req.body[field] === null
          ? undefined
          : Number(req.body[field]);
      }
    });

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
