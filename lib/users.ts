import db from './db';
import crypto from 'crypto';

export interface User {
  id?: number;
  username: string;
  display_name: string;
  email: string;
  password_hash?: string;
  is_admin?: number;
  is_suspended?: number;
  traffic_limit?: number;
  traffic_used?: number;
  created_at?: string;
  updated_at?: string;
}

// 密码加密
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// 验证用户名（3-20个字符，只能包含字母、数字、下划线）
export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// 验证显示名称（2-50个字符）
export function validateDisplayName(displayName: string): boolean {
  return displayName.length >= 2 && displayName.length <= 50;
}

// 验证邮箱
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 验证密码（至少8个字符，包含大小写字母和数字）
export function validatePassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// 检查是否有任何用户
export function hasAnyUser(): boolean {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get() as { count: number };
  return result.count > 0;
}

// 检查是否有管理员
export function hasAdmin(): boolean {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1');
  const result = stmt.get() as { count: number };
  return result.count > 0;
}

// 创建用户
export function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): User {
  const { password, ...userData } = user;
  
  // 验证输入
  if (!validateUsername(userData.username)) {
    throw new Error('用户名格式错误：需要3-20个字符，只能包含字母、数字和下划线');
  }
  if (!validateDisplayName(userData.display_name)) {
    throw new Error('显示名称格式错误：需要2-50个字符');
  }
  if (!validateEmail(userData.email)) {
    throw new Error('邮箱格式错误');
  }
  if (!validatePassword(password)) {
    throw new Error('密码格式错误：至少8个字符，必须包含大小写字母和数字');
  }

  const passwordHash = hashPassword(password);
  
  try {
    const stmt = db.prepare(
      'INSERT INTO users (username, display_name, email, password_hash, is_admin, is_suspended) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      userData.username,
      userData.display_name,
      userData.email,
      passwordHash,
      userData.is_admin || 0,
      userData.is_suspended || 0
    );
    
    return {
      id: Number(info.lastInsertRowid),
      ...userData,
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('UNIQUE constraint failed: users.username')) {
      throw new Error('用户名已存在');
    }
    if (err.message.includes('UNIQUE constraint failed: users.email')) {
      throw new Error('邮箱已被使用');
    }
    throw error;
  }
}

// 获取所有用户
export function getAllUsers(): Omit<User, 'password_hash'>[] {
  const stmt = db.prepare('SELECT id, username, display_name, email, is_admin, is_suspended, created_at, updated_at FROM users ORDER BY created_at DESC');
  return stmt.all() as Omit<User, 'password_hash'>[];
}

// 获取单个用户
export function getUserById(id: number): Omit<User, 'password_hash'> | undefined {
  const stmt = db.prepare('SELECT id, username, display_name, email, is_admin, is_suspended, created_at, updated_at FROM users WHERE id = ?');
  return stmt.get(id) as Omit<User, 'password_hash'> | undefined;
}

// 通过用户名获取用户（包含密码哈希，用于登录验证）
export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

// 删除用户
export function deleteUser(id: number) {
  // 不能删除最后一个管理员
  const user = getUserById(id);
  if (user?.is_admin) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1');
    const result = stmt.get() as { count: number };
    if (result.count <= 1) {
      throw new Error('不能删除最后一个管理员');
    }
  }
  
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(id);
}

// 挂起/恢复用户
export function suspendUser(id: number, suspended: boolean) {
  // 不能挂起管理员
  const user = getUserById(id);
  if (user?.is_admin && suspended) {
    throw new Error('不能挂起管理员账户');
  }
  
  const stmt = db.prepare('UPDATE users SET is_suspended = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(suspended ? 1 : 0, id);
}

// 更新用户
export function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>>) {
  if (updates.username && !validateUsername(updates.username)) {
    throw new Error('用户名格式错误：需要3-20个字符，只能包含字母、数字和下划线');
  }
  if (updates.display_name && !validateDisplayName(updates.display_name)) {
    throw new Error('显示名称格式错误：需要2-50个字符');
  }
  if (updates.email && !validateEmail(updates.email)) {
    throw new Error('邮箱格式错误');
  }
  
  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];
  
  try {
    const stmt = db.prepare(
      `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    );
    stmt.run(...values);
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('UNIQUE constraint failed: users.username')) {
      throw new Error('用户名已存在');
    }
    if (err.message.includes('UNIQUE constraint failed: users.email')) {
      throw new Error('邮箱已被使用');
    }
    throw error;
  }
}
