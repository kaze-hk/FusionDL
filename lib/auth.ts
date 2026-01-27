import { NextRequest } from 'next/server';
import { getUserByUsername, verifyPassword } from './users';
import crypto from 'crypto';

// 会话存储（生产环境应使用 Redis 或数据库）
const sessions = new Map<string, { userId: number; username: string; isAdmin: boolean; expiresAt: number }>();

// 生成会话令牌
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 创建会话
export function createSession(userId: number, username: string, isAdmin: boolean): string {
  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天过期
  
  sessions.set(token, {
    userId,
    username,
    isAdmin,
    expiresAt,
  });
  
  return token;
}

// 获取会话
export function getSession(token: string) {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  // 检查是否过期
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session;
}

// 删除会话
export function deleteSession(token: string) {
  sessions.delete(token);
}

// 从请求中获取会话
export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  
  if (!token) {
    return null;
  }
  
  return getSession(token);
}

// 验证登录
export function authenticate(username: string, password: string): { success: boolean; user?: { id: number; username: string; display_name: string; email: string; is_admin: boolean }; error?: string } {
  const user = getUserByUsername(username);
  
  if (!user) {
    return { success: false, error: '用户名或密码错误' };
  }
  
  if (user.is_suspended) {
    return { success: false, error: '账户已被挂起，请联系管理员' };
  }
  
  if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
    return { success: false, error: '用户名或密码错误' };
  }
  
  return {
    success: true,
    user: {
      id: user.id!,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      is_admin: user.is_admin === 1,
    },
  };
}

// 清理过期会话（定期调用）
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

// 每小时清理一次过期会话
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
