import { NextRequest, NextResponse } from 'next/server';
import { suspendUser } from '@/lib/users';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    
    // 检查是否为管理员
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: '无效的用户ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { suspended } = body;

    if (typeof suspended !== 'boolean') {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    suspendUser(userId, suspended);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    );
  }
}
