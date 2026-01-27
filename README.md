<div align="center">
  <img src="public/icons/worldwide-shipping.png" alt="FusionDL Logo" width="120" height="120">
  
  # FusionDL
  
  ### 一个为 yt-dlp 开发的视频下载前端
  
  基于 Next.js 构建，支持 YouTube、Bilibili、Twitter 等 1000+ 视频网站  
  视频下载能力由 yt-dlp 强势驱动，其他功能由本项目提供
  
  ---
  
  [中文](docs/README-zh_CN.md) | [English](docs/README-en_US.md)
  
</div>

---

## 界面预览
一方面本人的服务器资源不足，另一方面本项目的流量限制等功能建设还不完备，因此暂时只在这里挂上了截图，各位需要自行部署体验最终效果
<div align="center">
  <img src="docs/assets/image-00.png" alt="主界面" width="80%">
  <p><em>主界面 - 视频下载</em></p>
  
  <img src="docs/assets/image-01.png" alt="下载列表" width="80%">
  <p><em>移动端界面-下载列表管理</em></p>
</div>

## 功能特性
- 目前只能称得上一个还算不错的Demo，但还有很多路要走
- 高级的用户管理功能、看板和资源管理功能有待后期建设
- 更多的下载参数的支持有待后期建设

## 安装和运行
以下开发步骤只在Ubuntu24.04中验证。

除非您自己乐意并且有能力尝试新的环境，否则，Windows用户请新建一个Ubuntu24的WSL，Mac用户请从[orbstack](https://orbstack.dev/)安装一个虚拟机。

### 前置要求
确保你的系统已安装 yt-dlp：

```bash
# 基本依赖
sudo apt update

# 用 pipx 安装 yt-dlp（因为）Ubuntu 24 的PEP 668 保护机制 不允许通过pip3 install 直接往系统环境装包
sudo apt install -y pipx ffmpeg
pipx ensurepath
# 让 PATH 立即生效（当前 shell）
export PATH="$PATH:$HOME/.local/bin"

pipx install yt-dlp
yt-dlp --version
# 后续升级
pipx upgrade yt-dlp
```

### 拉取本项目
拉取到服务器

复制 `.env.example` 到 `.env` 并配置下载目录：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 下载目录（使用绝对路径，确保有写入权限）
DOWNLOAD_DIR=/home/momo/downloads

# 数据库目录（使用绝对路径）
DATABASE_DIR=/home/momo/yt-dlp-data

# yt-dlp 路径（留空自动检测）
YT_DLP_PATH=
```

**注意**：下载目录建议使用独立的目录，不要放在项目中。确保该目录有足够的存储空间。

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```
### 部署
建议使用pm2后台允许，再配nginx等，后续会补全

## API 端点

### 获取所有下载记录
```
GET /api/downloads
```

### 创建下载任务
```
POST /api/downloads
Body: { "url": "视频链接" }
```

### 获取单个下载记录
```
GET /api/downloads/[id]
```

### 删除下载记录
```
DELETE /api/downloads/[id]
```

### 获取视频信息
```
POST /api/video-info
Body: { "url": "视频链接" }
```

## 使用说明

1. 在输入框中粘贴视频链接
2. 点击"获取信息"查看视频详情
3. 确认后点击"开始下载"
4. 在下载列表中查看下载进度
5. "下载完成"指下载到服务器的指定目录，之后可通过浏览器下载文件到本地

## 支持的网站

yt-dlp 支持 1000+ 视频网站，包括但不限于：

- YouTube
- Bilibili
- Twitter/X
- TikTok
- Vimeo
- Dailymotion
- Facebook
- Instagram
- 更多...

## 注意事项

- 下载的文件保存在 `.env` 配置的 `DOWNLOAD_DIR` 目录
- 数据库文件保存在 `.env` 配置的 `DATABASE_DIR` 目录
- 确保配置的目录有写入权限和足够的存储空间
- 建议使用独立的下载目录，不要放在项目中
- 请遵守各网站的服务条款

## 许可证

AGPL-3.0
