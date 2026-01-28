import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getAllUsersTraffic } from '@/lib/traffic';

// 获取所有用户的流量信息
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    if (!session.isAdmin) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      );
    }

    const traffic = getAllUsersTraffic();
    return NextResponse.json({ success: true, traffic });
  } catch (error) {
    console.error('Error fetching traffic:', error);
    return NextResponse.json(
      { success: false, error: '获取流量信息失败' },
      { status: 500 }
    );
  }
}
