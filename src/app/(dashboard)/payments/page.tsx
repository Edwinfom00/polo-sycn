import { requireAuth, getCurrentUser } from "@/lib/auth-utils";
import { PaiementsView } from "@/modules/paiements/ui/views/paiements-view";

export default async function PaiementsPage() {
    await requireAuth();
    const user = await getCurrentUser();

    return <PaiementsView userRole={user!.role} />;
}
