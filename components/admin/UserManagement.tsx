'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  is_admin: number;
  is_suspended: number;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = '用户名需要3-20个字符，只能包含字母、数字和下划线';
    }

    if (formData.displayName.length < 2 || formData.displayName.length > 50) {
      newErrors.displayName = '显示名称需要2-50个字符';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      newErrors.password = '密码至少8个字符，必须包含大小写字母和数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          display_name: formData.displayName,
          email: formData.email,
          password: formData.password,
          is_admin: formData.isAdmin ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建用户失败');
      }

      setShowCreateModal(false);
      setFormData({
        username: '',
        displayName: '',
        email: '',
        password: '',
        isAdmin: false,
      });
      setErrors({});
      fetchUsers();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '创建用户失败' });
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除用户失败');
      }

      fetchUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除用户失败');
    }
  };

  const handleSuspendUser = async (userId: number, username: string, currentlySuspended: boolean) => {
    const action = currentlySuspended ? '恢复' : '挂起';
    if (!confirm(`确定要${action}用户 "${username}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suspended: !currentlySuspended,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${action}用户失败`);
      }

      fetchUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : `${action}用户失败`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">用户管理</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-600">管理系统用户账户</p>
      </div>

      {/* Actions */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新建用户
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  显示名称
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                    <div className="max-w-[80px] sm:max-w-none truncate">{user.username}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                    {user.display_name}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {user.is_admin ? (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full whitespace-nowrap">
                        管理员
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full whitespace-nowrap">
                        普通
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {user.is_suspended ? (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full whitespace-nowrap">
                        已挂起
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full whitespace-nowrap">
                        正常
                      </span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleSuspendUser(user.id, user.username, user.is_suspended === 1)}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                          user.is_suspended
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        {user.is_suspended ? '恢复' : '挂起'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 sm:py-12 text-gray-500 text-xs sm:text-sm">
                    暂无用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">新建用户</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3-20个字符"
                  required
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2-50个字符"
                  required
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="至少8位，含大小写字母和数字"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                  设为管理员
                </label>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      username: '',
                      displayName: '',
                      email: '',
                      password: '',
                      isAdmin: false,
                    });
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
