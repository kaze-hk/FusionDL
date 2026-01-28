import db from './db';

export interface TrafficLog {
  id?: number;
  user_id: number;
  download_id?: number;
  type: 'download_from_youtube' | 'download_to_user';
  bytes: number;
  description?: string;
  created_at?: string;
}

export interface UserTraffic {
  id: number;
  username: string;
  display_name: string;
  traffic_limit: number;
  traffic_used: number;
  traffic_remaining: number;
  traffic_usage_percentage: number;
}

// 记录流量使用
export function logTraffic(log: Omit<TrafficLog, 'id' | 'created_at'>): void {
  const stmt = db.prepare(
    'INSERT INTO traffic_logs (user_id, download_id, type, bytes, description) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(log.user_id, log.download_id || null, log.type, log.bytes, log.description || null);
  
  // 更新用户已使用流量
  const updateStmt = db.prepare(
    'UPDATE users SET traffic_used = traffic_used + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  updateStmt.run(log.bytes, log.user_id);
}

// 获取用户流量信息
export function getUserTraffic(userId: number): UserTraffic | null {
  const stmt = db.prepare(`
    SELECT id, username, display_name, traffic_limit, traffic_used
    FROM users
    WHERE id = ?
  `);
  const user = stmt.get(userId) as any;
  
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    traffic_limit: user.traffic_limit,
    traffic_used: user.traffic_used,
    traffic_remaining: user.traffic_limit - user.traffic_used,
    traffic_usage_percentage: (user.traffic_used / user.traffic_limit) * 100
  };
}

// 获取所有用户流量信息
export function getAllUsersTraffic(): UserTraffic[] {
  const stmt = db.prepare(`
    SELECT id, username, display_name, traffic_limit, traffic_used
    FROM users
    ORDER BY traffic_used DESC
  `);
  const users = stmt.all() as any[];
  
  return users.map(user => ({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    traffic_limit: user.traffic_limit,
    traffic_used: user.traffic_used,
    traffic_remaining: user.traffic_limit - user.traffic_used,
    traffic_usage_percentage: (user.traffic_used / user.traffic_limit) * 100
  }));
}

// 更新用户流量限制
export function updateUserTrafficLimit(userId: number, limitBytes: number): void {
  const stmt = db.prepare(
    'UPDATE users SET traffic_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(limitBytes, userId);
}

// 重置用户流量使用
export function resetUserTraffic(userId: number): void {
  const stmt = db.prepare(
    'UPDATE users SET traffic_used = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  stmt.run(userId);
}

// 检查用户流量是否足够
export function hasEnoughTraffic(userId: number, requiredBytes: number): boolean {
  const traffic = getUserTraffic(userId);
  if (!traffic) return false;
  return traffic.traffic_remaining >= requiredBytes;
}

// 获取用户的流量日志
export function getUserTrafficLogs(userId: number, limit: number = 50): TrafficLog[] {
  const stmt = db.prepare(`
    SELECT * FROM traffic_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(userId, limit) as TrafficLog[];
}

// 格式化字节数为可读格式
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
