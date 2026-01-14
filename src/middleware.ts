import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques (accessibles sans authentification)
const publicRoutes = ['/sign-in', '/sign-up', '/unauthorized'];

// Routes protégées par rôle
const roleProtectedRoutes = {
    '/admin': ['SUPER_ADMIN', 'ADMIN'],
    '/super-admin': ['SUPER_ADMIN'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Laisser passer les routes publiques
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Laisser passer les assets et API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Pour les autres routes, la vérification se fait côté serveur
    // via requireAuth() ou requireRole() dans les pages
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
