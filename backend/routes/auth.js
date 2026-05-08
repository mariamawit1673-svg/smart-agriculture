const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password, role = "farmer" } = req.body;

        if (!name || !password) {
            return res.status(400).json({ message: "Name and password are required" });
        }
        if (!email && !phone) {
            return res.status(400).json({ message: "Email or phone number is required" });
        }

        // Check duplicate
        if (email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(409).json({ message: "Email already registered" });
        }
        if (phone) {
            const exists = await User.findOne({ phone });
            if (exists) return res.status(409).json({ message: "Phone number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email: email || null, phone: phone || null, password: hashedPassword, role });
        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN — supports email or phone
router.post("/login", async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if (!password || (!email && !phone)) {
            return res.status(400).json({ message: "Email or phone, and password are required" });
        }

        const query = email ? { email } : { phone };
        const user = await User.findOne(query);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        res.json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
