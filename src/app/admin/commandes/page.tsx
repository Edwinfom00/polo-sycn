import { getCommandes } from "@/modules/commandes/actions";
import { AdminCommandesView } from "@/modules/admin/ui/views/admin-commandes-view";

export default async function AdminCommandesPage() {
    const result = await getCommandes();

    return (
        <AdminCommandesView
            commandes={result.data?.commandes || []}
        />
    );
}
