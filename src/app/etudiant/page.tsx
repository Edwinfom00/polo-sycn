import { getCurrentUser } from "@/lib/auth-utils";
import { EtudiantDashboardView } from "@/modules/etudiant/ui/views/etudiant-dashboard-view";

export default async function EtudiantDashboardPage() {
    const user = await getCurrentUser();

    return (
        <EtudiantDashboardView
            userId={user!.id}
            userName={user!.name}
            classeId={user!.classeId}
        />
    );
}
