import { NextRequest, NextResponse } from 'next/server';
import { createUser, hasAnyUser } from '@/lib/users';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经有用户
    if (hasAnyUser()) {
      return NextResponse.json(
        { error: '系统已初始化，无需再次设置' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, display_name, email, password } = body;

    // 验证必填字段
    if (!username || !display_name || !email || !password) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 创建管理员用户
    const user = createUser({
      username,
      display_name,
      email,
      password,
      is_admin: 1,
      is_suspended: 0,
    });

    // 自动创建会话并登录
    const token = createSession(user.id!, user.username, user.is_admin === 1);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        is_admin: user.is_admin,
      },
    });

    // 设置会话 cookie
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建管理员失败' },
      { status: 500 }
    );
  }
}
