import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { USER_ROLES, type UserRole } from "@/lib/constants/roles";

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    // Récupérer le rôle depuis la base de données
    const userWithRole = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1);

    if (userWithRole.length === 0) {
        return null;
    }

    return {
        ...session.user,
        role: userWithRole[0].role,
        classeId: userWithRole[0].classeId,
    };
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    return user;
}

export async function requireRole(requiredRole: UserRole) {
    const user = await requireAuth();

    const userRole = user.role as UserRole;

    if (!userRole || !hasRoleAccess(userRole, requiredRole)) {
        redirect('/unauthorized');
    }

    return { ...user, role: userRole };
}

function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    const hierarchy = {
        SUPER_ADMIN: 4,
        ADMIN: 3,
        DELEGUE: 2,
        ETUDIANT: 1,
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
}
