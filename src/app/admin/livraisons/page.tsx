import { getLivraisons, getCommandesValidees } from "@/modules/livraisons/actions";
import { AdminLivraisonsView } from "@/modules/admin/ui/views/admin-livraisons-view";

export default async function AdminLivraisonsPage() {
    const [livraisonsResult, commandesResult] = await Promise.all([
        getLivraisons(),
        getCommandesValidees(),
    ]);

    return (
        <AdminLivraisonsView
            livraisons={livraisonsResult.data?.livraisons || []}
            commandesValidees={commandesResult.data || []}
        />
    );
}
