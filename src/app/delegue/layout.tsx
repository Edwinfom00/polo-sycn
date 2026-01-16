import { requireRole } from '@/lib/auth-utils';
import { USER_ROLES } from '@/lib/constants/roles';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DelegueSidebar } from '@/modules/delegue/ui/components/delegue-sidebar';
import { DelegueNavbar } from '@/modules/delegue/ui/components/delegue-navbar';

interface Props {
    children: React.ReactNode;
}

export default async function DelegueLayout({ children }: Props) {
    // Vérifier que l'utilisateur est délégué
    await requireRole(USER_ROLES.DELEGUE);

    return (
        <SidebarProvider>
            <DelegueSidebar />
            <main className='flex flex-col h-screen w-screen bg-muted'>
                <DelegueNavbar />
                {children}
            </main>
        </SidebarProvider>
    );
}
