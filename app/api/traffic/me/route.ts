import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getUserTraffic } from '@/lib/traffic';

// 获取当前用户的流量信息
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const traffic = getUserTraffic(session.userId);
    
    if (!traffic) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, traffic });
  } catch (error) {
    console.error('Error fetching user traffic:', error);
    return NextResponse.json(
      { success: false, error: '获取流量信息失败' },
      { status: 500 }
    );
  }
}
