import { EtudiantPaiementsView } from "@/modules/etudiant/ui/views/etudiant-paiements-view";
import { getPaiementsByEtudiant } from "@/modules/paiements/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function EtudiantPaiementsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return null;
    }

    const result = await getPaiementsByEtudiant(session.user.id);

    return (
        <EtudiantPaiementsView
            paiements={result.data?.paiements || []}
        />
    );
}
