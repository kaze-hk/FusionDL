import { NextRequest } from 'next/server';
import { getUserByUsername, verifyPassword } from './users';
import crypto from 'crypto';
import db from './db';

// 生成会话令牌
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 创建会话
export function createSession(userId: number, username: string, isAdmin: boolean): string {
  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天过期
  
  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, username, is_admin, expires_at) 
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(token, userId, username, isAdmin ? 1 : 0, expiresAt);
  
  return token;
}

// 获取会话
export function getSession(token: string) {
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ?');
  const session = stmt.get(token) as { 
    token: string; 
    user_id: number; 
    username: string; 
    is_admin: number; 
    expires_at: number 
  } | undefined;
  
  if (!session) {
    return null;
  }
  
  // 检查是否过期
  if (Date.now() > session.expires_at) {
    deleteSession(token);
    return null;
  }
  
  return {
    userId: session.user_id,
    username: session.username,
    isAdmin: session.is_admin === 1,
    expiresAt: session.expires_at,
  };
}

// 删除会话
export function deleteSession(token: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
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
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < ?');
  stmt.run(now);
}

// 每小时清理一次过期会话
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
