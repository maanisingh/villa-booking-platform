const Login = require("../Models/Login.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ================== JWT TOKEN GENERATOR ==================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// ================== ADMIN LOGIN ==================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin from database
    const admin = await Login.findOne({ email, role: "admin" });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== CREATE OWNER (Admin Only) ==================
exports.createOwner = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, assignedVilla, status } =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email, and password required" });
    }

    const existing = await Login.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Owner with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const owner = await Login.create({
      name,
      email,
      password: hashed,
      phoneNumber,
      assignedVilla,
      status: status || "Pending",
      image,
      role: "owner",
    });

    res.status(201).json({
      success: true,
      message: "Owner created successfully",
      data: owner,
    });
  } catch (error) {
    console.error("❌ Create Owner Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== OWNER LOGIN ==================
exports.ownerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Login.findOne({ email, role: "owner" });
    if (!owner) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(owner);

    res.status(200).json({
      success: true,
      message: "Owner logged in successfully",
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phoneNumber: owner.phoneNumber,
        assignedVilla: owner.assignedVilla,
        status: owner.status,
        image: owner.image,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error("Owner Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== OWNER PROFILE (View Own Profile) ==================
exports.getOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const user = await Login.findById(ownerId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get Owner Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== OWNER PROFILE UPDATE (Self) ==================
exports.updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const updateData = req.body;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Remove empty values
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] === "" ||
        updateData[key] === null ||
        updateData[key] === undefined
      ) {
        delete updateData[key];
      }
    });

    const updated = await Login.findByIdAndUpdate(
      ownerId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== OWNER CHANGE PASSWORD (Self) ==================
exports.changeOwnerPassword = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await Login.findById(ownerId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password incorrect" });
    }

    // Hash and set the new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};


// ================== GET ALL OWNERS (Admin) ==================
exports.getAllOwners = async (req, res) => {
  try {
    const owners = await Login.find({ role: "owner" }).select("-password");
    res.status(200).json({ success: true, data: owners });
  } catch (error) {
    console.error("Get All Owners Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ================== DELETE OWNER (Admin) ==================
exports.deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = await Login.findById(id);
    if (!owner)
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });

    if (owner.image) {
      const imagePath = path.join(__dirname, "..", owner.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("⚠️ Failed to delete image:", err.message);
      });
    }

    await Login.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Owner deleted successfully" });
  } catch (error) {
    console.error("Delete Owner Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
