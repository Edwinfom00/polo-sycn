import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/constants/roles';

/**
 * Redirige l'utilisateur vers son dashboard selon son rôle
 */
export function redirectByRole(role: UserRole): never {
    switch (role) {
        case 'SUPER_ADMIN':
            redirect('/super-admin');
        case 'ADMIN':
            redirect('/admin');
        case 'DELEGUE':
            redirect('/delegue');
        case 'ETUDIANT':
            redirect('/etudiant');
        default:
            redirect('/etudiant');
    }
}

/**
 * Retourne le chemin du dashboard selon le rôle
 */
export function getDashboardPath(role: UserRole): string {
    switch (role) {
        case 'SUPER_ADMIN':
            return '/super-admin';
        case 'ADMIN':
            return '/admin';
        case 'DELEGUE':
            return '/delegue';
        case 'ETUDIANT':
            return '/etudiant';
        default:
            return '/etudiant';
    }
}
