import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允许访问 API 路由和静态资源
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next();
  }

  // 如果访问的是设置页面，允许通过
  if (pathname === '/setup') {
    return NextResponse.next();
  }

  // 检查是否需要初始化（这里我们通过请求头来判断）
  // 由于中间件不能直接访问数据库，我们需要在页面组件中处理重定向
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
