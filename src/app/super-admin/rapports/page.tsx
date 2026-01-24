import { getRapportComplet, getClassesList, getFilieresList } from "@/modules/rapports/actions";
import { RapportCompletView } from "@/modules/rapports/ui/views/rapport-complet-view";

export default async function SuperAdminRapportsPage() {
    const [rapportResult, classesResult, filieresResult] = await Promise.all([
        getRapportComplet(),
        getClassesList(),
        getFilieresList(),
    ]);

    if (!rapportResult.success || !rapportResult.data) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Erreur</h1>
                <p className="text-muted-foreground">{rapportResult.message}</p>
            </div>
        );
    }

    return (
        <RapportCompletView
            initialData={rapportResult.data}
            classes={classesResult.data || []}
            filieres={filieresResult.data || []}
        />
    );
}
