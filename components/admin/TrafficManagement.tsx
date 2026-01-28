'use client';

import { useState, useEffect } from 'react';

interface UserTraffic {
  id: number;
  username: string;
  display_name: string;
  traffic_limit: number;
  traffic_used: number;
  traffic_remaining: number;
  traffic_usage_percentage: number;
}

// 格式化字节数为可读格式
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function TrafficManagement() {
  const [traffic, setTraffic] = useState<UserTraffic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newLimit, setNewLimit] = useState<string>('');

  useEffect(() => {
    fetchTraffic();
  }, []);

  const fetchTraffic = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/traffic');
      const data = await response.json();
      
      if (data.success) {
        setTraffic(data.traffic);
        setError(null);
      } else {
        setError(data.error || '获取流量信息失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Error fetching traffic:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async (userId: number) => {
    const limitBytes = parseFloat(newLimit) * 1024 * 1024 * 1024; // 转换为字节
    
    if (isNaN(limitBytes) || limitBytes <= 0) {
      alert('请输入有效的流量限制（GB）');
      return;
    }

    try {
      const response = await fetch(`/api/traffic/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traffic_limit: limitBytes }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('流量限制已更新');
        setEditingUserId(null);
        setNewLimit('');
        fetchTraffic();
      } else {
        alert(data.error || '更新失败');
      }
    } catch (err) {
      alert('网络错误');
      console.error('Error updating limit:', err);
    }
  };

  const handleResetTraffic = async (userId: number, username: string) => {
    if (!confirm(`确定要重置 ${username} 的流量使用记录吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/traffic/${userId}/reset`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('流量已重置');
        fetchTraffic();
      } else {
        alert(data.error || '重置失败');
      }
    } catch (err) {
      alert('网络错误');
      console.error('Error resetting traffic:', err);
    }
  };

  const startEditing = (userId: number, currentLimit: number) => {
    setEditingUserId(userId);
    setNewLimit((currentLimit / (1024 * 1024 * 1024)).toFixed(2));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  已使用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  流量限制
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  剩余流量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  使用率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {traffic.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.display_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatBytes(user.traffic_used)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={newLimit}
                          onChange={(e) => setNewLimit(e.target.value)}
                          className="w-24 px-2 py-1 border rounded text-sm"
                          placeholder="GB"
                        />
                        <button
                          onClick={() => handleUpdateLimit(user.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(null);
                            setNewLimit('');
                          }}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {formatBytes(user.traffic_limit)}
                        </span>
                        <button
                          onClick={() => startEditing(user.id, user.traffic_limit)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          编辑
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={user.traffic_remaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {formatBytes(Math.max(0, user.traffic_remaining))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            user.traffic_usage_percentage >= 90
                              ? 'bg-red-500'
                              : user.traffic_usage_percentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(user.traffic_usage_percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {user.traffic_usage_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleResetTraffic(user.id, user.username)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      重置流量
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">流量统计说明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 从 YouTube 下载到服务器会消耗流量</li>
          <li>• 用户点击"保存"从服务器下载到本地也会消耗流量</li>
          <li>• 默认每个用户初始流量为 1GB</li>
          <li>• 可以为每个用户单独设置流量限制</li>
          <li>• 重置流量会将已使用流量清零</li>
        </ul>
      </div>
    </div>
  );
}
