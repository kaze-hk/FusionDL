'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoInfo from '@/components/VideoInfo';
import DownloadList from '@/components/DownloadList';

interface UserInfo {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export default function Home() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const checkAuth = async () => {
    try {
      // 先检查是否需要初始化
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      
      if (!usersData.users || usersData.users.length === 0) {
        router.push('/setup');
        return;
      }

      // 检查用户是否已登录
      const authResponse = await fetch('/api/auth/me');
      
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }

      const authData = await authResponse.json();
      
      if (authData.authenticated) {
        setUser(authData.user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        // 刷新下载列表
        setRefreshKey(prev => prev + 1);
      } else {
        alert('下载失败: ' + data.error);
      }
    } catch (error) {
      alert('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <header className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
              <img src="/icons/worldwide-shipping.png" width="24" height="24" alt="FusionDL" className="inline sm:w-7 sm:h-7 md:w-9 md:h-9 flex-shrink-0" /> 
              <span className="hidden xs:inline">FusionDL</span>
              <span className="xs:hidden">FDL</span>
            </h1>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs sm:text-sm text-gray-700 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <img src="/icons/user.png" width="14" height="14" alt="user" className="inline sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user?.username}</span>
                {user?.isAdmin && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full whitespace-nowrap">
                    管理员
                  </span>
                )}
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  {user?.isAdmin && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        router.push('/fusiondl');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      管理面板
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 text-center px-2 sm:px-3">
            使用 yt-dlp 内核，支持从 YouTube、Bilibili 等多个平台下载视频
          </p>
        </header>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-1 w-full">
          <VideoInfo onDownload={handleDownload} />
          <DownloadList key={refreshKey} />
        </div>

        <footer className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm px-2">
          <p>Powered by yt-dlp • 支持 1000+ 视频网站</p>
        </footer>
      </div>
    </div>
  );
}
