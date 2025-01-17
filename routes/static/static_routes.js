const express = require("express");
const router = express.Router();
const multer = require("multer");
const { safetyMiddleware, convertFileToMD, cleanMarkdown } = require("../middleware/convert");

const upload = multer(); // Configure multer to handle file uploads in memory

router
  .get('/', function (req, res) {
    res.render("home");
  })
  .post("/upload", upload.single("file"), safetyMiddleware, async function (req, res) {
    try {
      const ext = req.file.originalname.split(".").pop().toLowerCase();
      const markdown = await convertFileToMD(req.file.buffer, ext);
      const htmlContent = cleanMarkdown(markdown);
      res.json({ success: true, html: htmlContent });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ success: false, message: "File conversion failed." });
    }
  });

module.exports = router;
