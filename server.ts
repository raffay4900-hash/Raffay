import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure upload directory exists
const uploadsDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded public images
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  immutable: true
}));

// Upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { dataUrl, fileName } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'dataUrl is required' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'jpg';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrl, 'base64');
    }

    const cleanBase = (fileName || 'product')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueName = `img_${Date.now()}_${cleanBase}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    res.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName
    });
  } catch (error: any) {
    console.error('Upload error in server:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Serve frontend build if dist exists
const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LOGI MARKETING Server running on http://0.0.0.0:${PORT}`);
});
