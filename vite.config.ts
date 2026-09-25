import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function uploadPlugin(): Plugin {
  return {
    name: 'logi-upload-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/upload' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const { dataUrl, fileName } = parsed;
                if (!dataUrl) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'dataUrl is required' }));
                  return;
                }

                // Parse base64
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

                const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadsDir)) {
                  fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const cleanBase = (fileName || 'product')
                  .replace(/[^a-zA-Z0-9_-]/g, '_')
                  .substring(0, 30);
                const uniqueName = `img_${Date.now()}_${cleanBase}.${ext}`;
                const filePath = path.join(uploadsDir, uniqueName);
                fs.writeFileSync(filePath, buffer);

                const publicUrl = `/uploads/${uniqueName}`;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  url: publicUrl,
                  fileName: uniqueName
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Failed to save file' }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Upload processing error' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), uploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
