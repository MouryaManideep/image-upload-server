const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const uploadFile = require("./s3");
require("dotenv").config();

const app = express();

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/PNG allowed"));
    }
  },
});

// Health / test route
app.get("/", (req, res) => {
  res.send(`Server running on PORT ${process.env.PORT} 🚀`);
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // 🔥 Load balancing visibility
    console.log(`Handled by PORT: ${process.env.PORT}`);

    console.log("File received:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;

    const fileUrl = await uploadFile(req.file, fileName);

    res.status(200).json({
      message: "Upload successful",
      url: fileUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);

    res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.message === "Only JPG/PNG allowed") {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});