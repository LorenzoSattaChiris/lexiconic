// convert.js - Middleware for File Conversion

const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth"); // DOCX -> HTML
const pdfParse = require("pdf-parse"); // PDF -> text
const XLSX = require("xlsx"); // XLSX/CSV -> JSON
const TurndownService = require("turndown");
const { marked } = require("marked");

const turndownService = new TurndownService();

// Adjust as needed:
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 20MB
const ALLOWED_EXTENSIONS = [
  "txt", "md", "html", "xml",
  "docx", "pdf", "xlsx", "csv", "json"
];

/**
 * Safety middleware to check file validity before conversion
 */
function safetyMiddleware(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Check file size
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).send("File is too large.");
    }

    // Check file extension
    const ext = path.extname(req.file.originalname).replace(".", "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(415).send(`File type .${ext} is not supported.`);
    }

    next();
  } catch (err) {
    console.error("Safety check error:", err);
    return res.status(500).send("File validation failed.");
  }
}

/**
 * Reads a file from disk (or buffer) and converts to Markdown
 */
async function convertFileToMD(filePathOrBuffer, ext) {
  let fileBuffer;

  // If it's a path (string), read its content; otherwise treat as buffer
  if (typeof filePathOrBuffer === "string") {
    fileBuffer = fs.readFileSync(filePathOrBuffer);
  } else {
    fileBuffer = filePathOrBuffer;
  }

  // Convert the file content based on the extension
  switch (ext) {
    case "txt":
    case "md":
      return fileBuffer.toString("utf-8");

    case "html":
    case "xml":
      // Convert HTML/XML to MD via Turndown
      return turndownService.turndown(fileBuffer.toString("utf-8"));

    case "docx": {
      // DOCX -> HTML -> MD
      const result = await mammoth.convertToHtml({ buffer: fileBuffer });
      return turndownService.turndown(result.value);
    }

    case "pdf": {
      // PDF -> text -> MD
      const data = await pdfParse(fileBuffer);
      return turndownService.turndown(data.text);
    }

    case "xlsx":
    case "csv": {
      // Convert spreadsheet to JSON array, then to a table in MD
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1, // each row is an array
      });

      // Build a quick markdown table
      let mdTable = "";
      sheet.forEach((row, index) => {
        const line = "| " + row.join(" | ") + " |\n";
        mdTable += line;
        // Optionally add a separator line right after the first row for better format
        if (index === 0 && row.length > 1) {
          mdTable += "| " + row.map(() => "---").join(" | ") + " |\n";
        }
      });
      return mdTable;
    }

    case "json":
      // JSON -> code block
      return "```json\n" + fileBuffer.toString("utf-8") + "\n```";

    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

/**
 * Clean up Markdown content and convert to HTML
 */
function cleanMarkdown(content) {
  const apiKeyPatterns = [
    /\b[A-Za-z0-9]{32}\b/, // General 32-character API keys
    /\bAIza[0-9A-Za-z_-]{35}\b/, // Google API keys
    /\b[A-Za-z0-9_-]{39}\b/, // AWS keys
    /\bsk-proj-[A-Za-z0-9_\-]{20,}\b/ // OpenAI-style keys
  ];

  // Function to detect and mask API keys
  function maskApiKeys(input) {
    return apiKeyPatterns.reduce((text, pattern) => {
      return text.replace(pattern, '[REDACTED]');
    }, input);
  }

  // Perform API key masking
  const cleanedContent = maskApiKeys(content);

  // Convert Markdown to HTML
  const htmlContent = marked(cleanedContent);

  return htmlContent; // Return the cleaned HTML content
}

module.exports = {
  safetyMiddleware,
  convertFileToMD,
  cleanMarkdown,
};
