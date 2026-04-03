import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean up temp files older than 1 hour
export const cleanupTempFiles = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'temp');
  
  if (!fs.existsSync(uploadsDir)) {
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtimeMs > oneHour) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up temp file: ${file}`);
    }
  });
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);
