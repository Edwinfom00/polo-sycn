export const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    DELEGUE: 'DELEGUE',
    ETUDIANT: 'ETUDIANT',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_HIERARCHY = {
    SUPER_ADMIN: 4,
    ADMIN: 3,
    DELEGUE: 2,
    ETUDIANT: 1,
} as const;

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isSuperAdmin(userRole: UserRole): boolean {
    return userRole === USER_ROLES.SUPER_ADMIN;
}

export function isAdmin(userRole: UserRole): boolean {
    return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPER_ADMIN;
}
