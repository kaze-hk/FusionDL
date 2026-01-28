'use client';

import Sidebar from '@/components/admin/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FusionDLDashboard() {
  const router = useRouter();

  useEffect(() => {
    // 默认重定向到用户管理页面
    router.replace('/fusiondl/users');
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pt-16">
        <div className="p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-600">正在跳转...</div>
          </div>
        </div>
      </main>
    </div>
  );
}

