'use client';

import { useState, useEffect } from 'react';

interface UserTraffic {
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

export default function TrafficInfo() {
  const [traffic, setTraffic] = useState<UserTraffic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraffic();
  }, []);

  const fetchTraffic = async () => {
    try {
      const response = await fetch('/api/traffic/me');
      const data = await response.json();
      
      if (data.success) {
        setTraffic(data.traffic);
      }
    } catch (error) {
      console.error('Error fetching traffic:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !traffic) {
    return null;
  }

  const isWarning = traffic.traffic_usage_percentage >= 70;
  const isCritical = traffic.traffic_usage_percentage >= 90;

  return (
    <div className={`rounded-lg p-4 ${
      isCritical ? 'bg-red-50 border border-red-200' : 
      isWarning ? 'bg-yellow-50 border border-yellow-200' : 
      'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-semibold ${
          isCritical ? 'text-red-900' : 
          isWarning ? 'text-yellow-900' : 
          'text-blue-900'
        }`}>
          流量使用情况
        </h3>
        <span className={`text-xs ${
          isCritical ? 'text-red-700' : 
          isWarning ? 'text-yellow-700' : 
          'text-blue-700'
        }`}>
          {traffic.traffic_usage_percentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isCritical ? 'bg-red-500' : 
            isWarning ? 'bg-yellow-500' : 
            'bg-blue-500'
          }`}
          style={{
            width: `${Math.min(traffic.traffic_usage_percentage, 100)}%`,
          }}
        />
      </div>
      
      <div className={`text-xs ${
        isCritical ? 'text-red-800' : 
        isWarning ? 'text-yellow-800' : 
        'text-blue-800'
      }`}>
        已使用 {formatBytes(traffic.traffic_used)} / {formatBytes(traffic.traffic_limit)}
        {traffic.traffic_remaining > 0 ? (
          <span> (剩余 {formatBytes(traffic.traffic_remaining)})</span>
        ) : (
          <span className="font-semibold"> (流量已用完)</span>
        )}
      </div>
    </div>
  );
}
