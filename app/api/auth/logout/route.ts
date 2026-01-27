import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, deleteSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;

    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    
    // 删除 cookie
    response.cookies.delete('session_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
