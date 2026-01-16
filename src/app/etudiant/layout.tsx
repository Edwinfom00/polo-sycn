import { requireRole } from '@/lib/auth-utils';
import { USER_ROLES } from '@/lib/constants/roles';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EtudiantSidebar } from '@/modules/etudiant/ui/components/etudiant-sidebar';
import { EtudiantNavbar } from '@/modules/etudiant/ui/components/etudiant-navbar';

interface Props {
    children: React.ReactNode;
}

export default async function EtudiantLayout({ children }: Props) {
    // Vérifier que l'utilisateur est bien un étudiant
    await requireRole(USER_ROLES.ETUDIANT);

    return (
        <SidebarProvider>
            <EtudiantSidebar />
            <main className='flex flex-col h-screen w-screen bg-muted'>
                <EtudiantNavbar />
                {children}
            </main>
        </SidebarProvider>
    );
}
