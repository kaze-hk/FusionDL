'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function FusionDLLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const authResponse = await fetch('/api/auth/me');
      
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }

      const authData = await authResponse.json();
      
      if (!authData.authenticated || !authData.user.isAdmin) {
        alert('需要管理员权限才能访问此页面');
        router.push('/');
        return;
      }

      setAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
