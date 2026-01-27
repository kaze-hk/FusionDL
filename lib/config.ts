import path from 'path';
import fs from 'fs';

// 获取下载目录
export function getDownloadDir(): string {
  const downloadDir = process.env.DOWNLOAD_DIR || '/home/momo/downloads';
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  return downloadDir;
}

// 获取数据库目录
export function getDatabaseDir(): string {
  const dbDir = process.env.DATABASE_DIR || '/home/momo/yt-dlp-data';
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return dbDir;
}

// 获取 yt-dlp 路径
export function getYtDlpPath(): string {
  if (process.env.YT_DLP_PATH) {
    return process.env.YT_DLP_PATH;
  }
  
  // 检查常见位置
  const possiblePaths = [
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    path.join(process.env.HOME || '', '.local/bin/yt-dlp'),
  ];
  
  for (const ytDlpPath of possiblePaths) {
    if (fs.existsSync(ytDlpPath)) {
      return ytDlpPath;
    }
  }
  
  // 如果都找不到，返回默认值，让系统 PATH 处理
  return 'yt-dlp';
}
