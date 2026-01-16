import { getCommande } from "@/modules/commandes/actions";
import { SuperAdminCommandeDetailView } from "@/modules/super-admin/ui/views/super-admin-commande-detail-view";
import { redirect } from "next/navigation";

export default async function AdminCommandeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await getCommande(id);

    if (!result.success || !result.data) {
        redirect('/admin/commandes');
    }

    return <SuperAdminCommandeDetailView commande={result.data} backUrl="/admin/commandes" />;
}
