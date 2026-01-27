'use client';

import { useEffect, useState } from 'react';

interface Download {
  id: number;
  url: string;
  title?: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress?: number;
  file_path?: string;
  file_size?: number;
  thumbnail?: string;
  duration?: string;
  error_message?: string;
  created_at?: string;
}

export default function DownloadList() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/downloads');
      const data = await response.json();
      if (data.success) {
        setDownloads(data.downloads);
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 3000); // 每3秒刷新
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      const response = await fetch(`/api/downloads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDownloads();
      }
    } catch (error) {
      console.error('Failed to delete download:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'downloading':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'downloading':
        return '下载中';
      case 'failed':
        return '失败';
      case 'pending':
        return '等待中';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full overflow-hidden">
        <div className="text-center text-gray-600">加载中...</div>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full overflow-hidden">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">下载历史</h2>
        <div className="text-center text-gray-500 py-8">暂无下载记录</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 w-full overflow-hidden">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">下载历史</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white w-full"
          >
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 w-full">
              {download.thumbnail && (
                <div className="w-full sm:w-48 flex-shrink-0 overflow-hidden relative">
                  <img
                    src={`/api/thumbnail?url=${encodeURIComponent(download.thumbnail)}`}
                    alt={download.title || 'Video'}
                    className="w-full h-48 sm:h-full object-cover"
                    onError={(e) => {
                      // 如果代理失败，尝试直接加载
                      const img = e.target as HTMLImageElement;
                      if (download.thumbnail && !img.src.includes(download.thumbnail)) {
                        img.src = download.thumbnail;
                      }
                    }}
                  />
                  <span
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                      download.status
                    )}`}
                  >
                    {getStatusText(download.status)}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0 p-3 sm:p-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 break-words mb-2">
                    {download.title || '获取标题中...'}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 truncate mb-2 sm:mb-3 hover:text-blue-600 transition-colors">
                    <a href={download.url} target="_blank" rel="noopener noreferrer">
                      {download.url}
                    </a>
                  </p>

                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    {download.duration && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/hourglass-end.png" width="14" height="14" alt="duration" className="inline-block sm:w-4 sm:h-4" />
                        <span>{download.duration}</span>
                      </span>
                    )}
                    {download.file_size && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/data-store.png" width="14" height="14" alt="file-size" className="inline-block sm:w-4 sm:h-4" />
                        <span>{formatFileSize(download.file_size)}</span>
                      </span>
                    )}
                    {download.created_at && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/calendar-clock.png" width="14" height="14" alt="date" className="inline-block sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{formatDate(download.created_at)}</span>
                        <span className="sm:hidden">{new Date(download.created_at).toLocaleDateString('zh-CN')}</span>
                      </span>
                    )}
                  </div>

                {download.status === 'downloading' && (
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">下载进度</span>
                      <span className="text-xs font-semibold text-blue-600">{download.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${download.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {download.error_message && (
                  <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600 flex items-start gap-2">
                      <span className="text-sm sm:text-base">❌</span>
                      <span className="break-words">{download.error_message}</span>
                    </p>
                  </div>
                )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {download.status === 'completed' && download.file_path && (
                    <a
                      href={`/api/downloads/${download.id}/file`}
                      download
                      className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>保存</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(download.id)}
                    className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-white text-red-600 font-medium rounded-lg border-2 border-red-600 hover:bg-red-600 hover:text-white active:scale-95 transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
