'use client';

import Sidebar from '@/components/admin/Sidebar';
import TrafficManagement from '@/components/admin/TrafficManagement';

export default function TrafficPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pt-16 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">流量管理</h1>
            <p className="text-gray-600 mt-2">查看和管理所有用户的流量使用情况</p>
          </div>
          <TrafficManagement />
        </div>
      </main>
    </div>
  );
}
