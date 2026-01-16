import { requireRole } from '@/lib/auth-utils';
import { USER_ROLES } from '@/lib/constants/roles';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboadSidebar } from '@/modules/dashboard/ui/components/dashboard-sidebar';
import { DashboardNavbar } from '@/modules/dashboard/ui/components/dashboard-navbar';

interface Props {
    children: React.ReactNode;
}

export default async function SuperAdminLayout({ children }: Props) {
    // Vérifier que l'utilisateur est super admin
    await requireRole(USER_ROLES.SUPER_ADMIN);

    return (
        <SidebarProvider>
            <DashboadSidebar />
            <main className='flex flex-col h-screen w-screen bg-muted'>
                <DashboardNavbar />
                {children}
            </main>
        </SidebarProvider>
    );
}
