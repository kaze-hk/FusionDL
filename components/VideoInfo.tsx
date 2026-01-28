'use client';

import { useState } from 'react';

interface VideoInfoProps {
  onDownload: (url: string, videoInfo?: any) => void;
}

export default function VideoInfo({ onDownload }: VideoInfoProps) {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInfo = async () => {
    if (!url.trim()) {
      setError('请输入视频链接');
      return;
    }

    setLoading(true);
    setError('');
    setInfo(null);

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setInfo(data.info);
      } else {
        setError(data.error || '获取视频信息失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    onDownload(url, info);
    setUrl('');
    setInfo(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">视频下载器</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchInfo()}
          placeholder="输入视频链接（YouTube, Bilibili等）"
          className="flex-1 w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 min-w-0"
        />
        <button
          onClick={fetchInfo}
          disabled={loading}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
        >
          <img 
            src="/icons/search.png" 
            alt="搜索" 
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {info && (
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {info.thumbnail && (
              <img
                src={`/api/thumbnail?url=${encodeURIComponent(info.thumbnail)}`}
                alt={info.title}
                className="w-full sm:w-48 h-auto sm:h-36 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  // 如果代理失败，尝试直接加载
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('direct=true')) {
                    img.src = `${info.thumbnail}`;
                  }
                }}
              />
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-gray-800 break-words">{info.title}</h3>
              <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                <p className="flex items-center gap-1"><img src="/icons/user.png" width="14" height="14" alt="uploader" className="inline flex-shrink-0" /> <span className="truncate min-w-0">{info.uploader}</span></p>
                <p className="flex items-center gap-1"><img src="/icons/hourglass-end.png" width="14" height="14" alt="duration" className="inline flex-shrink-0" /> 时长: {info.duration}</p>
                <p className="flex items-center gap-1"><img src="/icons/eye.png" width="14" height="14" alt="views" className="inline flex-shrink-0" /> 观看: {formatNumber(info.view_count)}</p>
                <p className="flex items-center gap-1"><img src="/icons/thumbs-up.png" width="14" height="14" alt="likes" className="inline flex-shrink-0" /> 点赞: {formatNumber(info.like_count)}</p>
              </div>
            </div>
          </div>

          {info.description && (
            <div className="w-full overflow-hidden">
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 break-words">{info.description}</p>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            开始下载
          </button>
        </div>
      )}
    </div>
  );
}
