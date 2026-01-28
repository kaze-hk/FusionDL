import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { updateUserTrafficLimit, resetUserTraffic, getUserTraffic } from '@/lib/traffic';

// 更新用户流量限制
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params;
    const userId = parseInt(idParam);
    const { traffic_limit } = await request.json();

    if (!traffic_limit || traffic_limit < 0) {
      return NextResponse.json(
        { success: false, error: '流量限制必须为正数' },
        { status: 400 }
      );
    }

    updateUserTrafficLimit(userId, traffic_limit);
    const updatedTraffic = getUserTraffic(userId);

    return NextResponse.json({ 
      success: true, 
      message: '流量限制已更新',
      traffic: updatedTraffic
    });
  } catch (error) {
    console.error('Error updating traffic limit:', error);
    return NextResponse.json(
      { success: false, error: '更新流量限制失败' },
      { status: 500 }
    );
  }
}
