import { requireRole } from '@/lib/auth-utils';
import { USER_ROLES } from '@/lib/constants/roles';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/modules/admin/ui/components/admin-sidebar';
import { AdminNavbar } from '@/modules/admin/ui/components/admin-navbar';

interface Props {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
    // Vérifier que l'utilisateur est admin ou super admin
    await requireRole(USER_ROLES.ADMIN);

    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className='flex flex-col h-screen w-screen bg-muted'>
                <AdminNavbar />
                {children}
            </main>
        </SidebarProvider>
    );
}
