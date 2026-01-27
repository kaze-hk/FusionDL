# FusionDL: A Video Download Frontend for yt-dlp

Based on Next.js, supports 1000+ video sites including YouTube, Bilibili, Twitter, and more. Download capabilities powered by yt-dlp, with additional features provided by this project.

## Features
- Currently a decent demo, but there's still a long way to go
- Advanced user management, dashboard, and resource management features to be developed
- More download parameters support to be added

## Installation and Setup
The following development steps have been tested on Ubuntu 24.04.

Unless you're willing and capable of trying new environments, Windows users should create an Ubuntu 24 WSL, and Mac users should install a virtual machine from [orbstack](https://orbstack.dev/).

### Prerequisites
Make sure yt-dlp is installed on your system:

```bash
# Basic dependencies
sudo apt update

# Install yt-dlp using pipx (because Ubuntu 24's PEP 668 protection mechanism doesn't allow direct installation via pip3 install)
sudo apt install -y pipx ffmpeg
pipx ensurepath
# Make PATH effective immediately (current shell)
export PATH="$PATH:$HOME/.local/bin"

pipx install yt-dlp
yt-dlp --version
# For future upgrades
pipx upgrade yt-dlp
```

### Clone the Project
Clone to your server

Copy `.env.example` to `.env` and configure the download directory:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
# Download directory (use absolute path, ensure write permissions)
DOWNLOAD_DIR=/home/momo/downloads

# Database directory (use absolute path)
DATABASE_DIR=/home/momo/yt-dlp-data

# yt-dlp path (leave empty for auto-detection)
YT_DLP_PATH=
```

**Note**: It's recommended to use a separate directory for downloads, not within the project. Ensure the directory has sufficient storage space.

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Visit http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Deployment
It's recommended to use pm2 for background running, then configure nginx, etc. Will be supplemented later.

## API Endpoints

### Get all download records
```
GET /api/downloads
```

### Create download task
```
POST /api/downloads
Body: { "url": "video link" }
```

### Get single download record
```
GET /api/downloads/[id]
```

### Delete download record
```
DELETE /api/downloads/[id]
```

### Get video information
```
POST /api/video-info
Body: { "url": "video link" }
```

## Usage Instructions

1. Paste video link in the input box
2. Click "Get Info" to view video details
3. Confirm and click "Start Download"
4. Check download progress in the download list
5. "Download Complete" means downloaded to the server's specified directory, after which you can download the file to your local machine via browser

## Supported Sites

yt-dlp supports 1000+ video sites, including but not limited to:

- YouTube
- Bilibili
- Twitter/X
- TikTok
- Vimeo
- Dailymotion
- Facebook
- Instagram
- And more...

## Notes

- Downloaded files are saved in the `DOWNLOAD_DIR` directory configured in `.env`
- Database files are saved in the `DATABASE_DIR` directory configured in `.env`
- Ensure configured directories have write permissions and sufficient storage space
- It's recommended to use a separate download directory, not within the project
- Please comply with the terms of service of each website

## License

AGPL-3.0
