import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/users';
import { getSessionFromRequest } from '@/lib/auth';

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    // 不需要登录就能获取用户列表（用于检查是否需要初始化）
    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// 创建新用户（需要管理员权限）
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    
    // 检查是否为管理员
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, display_name, email, password, is_admin } = body;

    // 验证必填字段
    if (!username || !display_name || !email || !password) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 创建用户
    const user = createUser({
      username,
      display_name,
      email,
      password,
      is_admin: is_admin || 0,
      is_suspended: 0,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建用户失败' },
      { status: 500 }
    );
  }
}
