import { getCommande } from "@/modules/commandes/actions";
import { EtudiantCommandeDetailView } from "@/modules/etudiant/ui/views/etudiant-commande-detail-view";
import { redirect } from "next/navigation";

export default async function EtudiantCommandeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await getCommande(id);

    if (!result.success || !result.data) {
        redirect('/etudiant/commandes');
    }

    return <EtudiantCommandeDetailView commande={result.data} />;
}
