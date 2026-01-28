import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { resetUserTraffic, getUserTraffic } from '@/lib/traffic';

// 重置用户流量
export async function POST(
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

    resetUserTraffic(userId);
    const updatedTraffic = getUserTraffic(userId);

    return NextResponse.json({ 
      success: true, 
      message: '流量已重置',
      traffic: updatedTraffic
    });
  } catch (error) {
    console.error('Error resetting traffic:', error);
    return NextResponse.json(
      { success: false, error: '重置流量失败' },
      { status: 500 }
    );
  }
}
