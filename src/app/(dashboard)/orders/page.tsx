import { requireAuth, getCurrentUser } from "@/lib/auth-utils";
import { CommandesView } from "@/modules/commandes/ui/views/commandes-view";

export default async function MesCommandesPage() {
    await requireAuth();
    const user = await getCurrentUser();

    return <CommandesView userRole={user!.role} />;
}
