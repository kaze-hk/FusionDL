'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { name: '用户管理', href: '/fusiondl/users', icon: '/icons/users.png' },
  { name: '流量管理', href: '/fusiondl/traffic', icon: '/icons/data-store.png' },
  // 以后可以在这里添加更多菜单项
  // { name: '下载管理', href: '/fusiondl/downloads', icon: '/icons/data-store.png' },
  // { name: '系统设置', href: '/fusiondl/settings', icon: '/icons/settings.png' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button - 在所有设备上都显示 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">FusionDL 管理</h1>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          w-64 z-50 top-16 bottom-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 pt-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center px-4 py-3 rounded-lg text-sm font-medium
                        transition-colors
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Image 
                        src={item.icon} 
                        alt={item.name}
                        width={20}
                        height={20}
                        className="mr-3"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                router.push('/');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回主页
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
