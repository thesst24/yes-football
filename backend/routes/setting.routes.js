const express = require("express");
const router = express.Router();
const Setting = require("../models/setting.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const upload = multer({ dest: "uploads/" });


// 🔹 helper ลบไฟล์เก่า
function deleteOldFile(filePath) {
  if (!filePath) return;

  const fullPath = path.join(__dirname, "..", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log("🗑 Deleted old file:", fullPath);
  }
}


// 🔹 GET setting
router.get("/", async (req, res) => {
  const setting = await Setting.findOne();
  res.json(setting);
});


// 🔥 Upload Background (ลบของเก่าด้วย)
router.post("/upload-background", upload.single("image"), async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();

    // ✅ ลบรูปเก่า
    if (setting.cardBackground) {
      deleteOldFile(setting.cardBackground);
    }

    setting.cardBackground = "/uploads/" + req.file.filename;
    await setting.save();

    res.json({ message: "Background Updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});


// 🔥 Upload QR (ลบของเก่าด้วย)
router.post("/upload-qr", upload.single("image"), async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();

    if (setting.qrImage) {
      deleteOldFile(setting.qrImage);
    }

    setting.qrImage = "/uploads/" + req.file.filename;
    await setting.save();

    res.json({ message: "QR Updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;