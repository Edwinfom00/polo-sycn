import { getPaiements } from "@/modules/paiements/actions";
import { AdminPaiementsView } from "@/modules/admin/ui/views/admin-paiements-view";

export default async function AdminPaiementsPage() {
    const result = await getPaiements({ limit: 1000 }); // Récupérer tous les paiements

    return (
        <AdminPaiementsView
            paiements={result.data?.paiements || []}
        />
    );
}
