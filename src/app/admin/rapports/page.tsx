import { getRapportsStats } from "@/modules/dashboard/actions/rapports";
import { AdminRapportsView } from "@/modules/admin/ui/views/admin-rapports-view";

export default async function AdminRapportsPage() {
    const result = await getRapportsStats();

    return (
        <AdminRapportsView
            stats={result.data || null}
        />
    );
}
