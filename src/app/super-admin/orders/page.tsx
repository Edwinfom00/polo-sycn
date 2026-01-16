import { getCommandes } from "@/modules/commandes/actions";
import { SuperAdminCommandesView } from "@/modules/super-admin/ui/views/super-admin-commandes-view";

export default async function SuperAdminOrdersPage() {
    const result = await getCommandes();

    return (
        <SuperAdminCommandesView
            commandes={result.data?.commandes || []}
        />
    );
}
