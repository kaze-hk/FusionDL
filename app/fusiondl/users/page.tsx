'use client';

import Sidebar from '@/components/admin/Sidebar';
import UserManagement from '@/components/admin/UserManagement';

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pt-16 overflow-auto">
        <div className="p-6">
          <UserManagement />
        </div>
      </main>
    </div>
  );
}
