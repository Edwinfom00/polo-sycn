import { EtudiantLivraisonsView } from "@/modules/etudiant/ui/views/etudiant-livraisons-view";
import { getLivraisonsByEtudiant } from "@/modules/livraisons/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function EtudiantLivraisonsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return null;
    }

    const result = await getLivraisonsByEtudiant(session.user.id);

    return (
        <EtudiantLivraisonsView
            livraisons={result.data?.livraisons || []}
        />
    );
}
