import { NextRequest, NextResponse } from 'next/server';
import { executeYtDlp } from '@/lib/ytdlp';

// 获取视频信息（不下载）
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // 使用 yt-dlp 获取视频信息
    const stdout = await executeYtDlp(`--dump-json "${url}"`);
    const info = JSON.parse(stdout);

    return NextResponse.json({
      success: true,
      info: {
        title: info.title,
        description: info.description,
        thumbnail: info.thumbnail,
        duration: info.duration_string || `${info.duration}s`,
        uploader: info.uploader,
        upload_date: info.upload_date,
        view_count: info.view_count,
        like_count: info.like_count,
        formats: info.formats?.map((f: any) => ({
          format_id: f.format_id,
          ext: f.ext,
          quality: f.format_note,
          filesize: f.filesize,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch video info' },
      { status: 500 }
    );
  }
}
