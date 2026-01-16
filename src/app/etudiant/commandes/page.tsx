import { getCommandes } from "@/modules/commandes/actions";
import { getProduits, getTailles, getCouleurs } from "@/modules/produits/actions";
import { EtudiantCommandesView } from "@/modules/etudiant/ui/views/etudiant-commandes-view";
import { redirect } from "next/navigation";

export default async function EtudiantCommandesPage() {
    const [commandesResult, produitsResult, taillesResult, couleursResult] = await Promise.all([
        getCommandes(),
        getProduits(),
        getTailles(),
        getCouleurs(),
    ]);

    if (!commandesResult.success) {
        redirect('/etudiant');
    }

    return (
        <EtudiantCommandesView
            commandes={commandesResult.data!.commandes}
            produits={produitsResult.data?.produits || []}
            tailles={taillesResult.data || []}
            couleurs={couleursResult.data || []}
        />
    );
}
