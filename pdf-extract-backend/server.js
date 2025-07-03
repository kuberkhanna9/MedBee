const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/extract-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    fs.unlinkSync(req.file.path); // Clean up uploaded file
    res.json({ text: data.text, filename: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract text from PDF.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`PDF Extractor running on port ${PORT}`)); 