const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const recommendRoutes = require("./routes/recommend");
const cropRoutes = require("./routes/crops");
const profileRoutes = require("./routes/profiles");
const historyRoutes = require("./routes/history");
const pestRoutes = require("./routes/pestRoutes");
const advisoryRoutes = require("./routes/advisory");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/pests", pestRoutes);
app.use("/api/advisory", advisoryRoutes);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/smart_agriculture")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Home route
app.get("/", (req, res) => {
    res.send("Smart Agriculture API Running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
