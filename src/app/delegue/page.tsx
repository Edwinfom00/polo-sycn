import { getCurrentUser } from "@/lib/auth-utils";
import { DelegueDashboardView } from "@/modules/delegue/ui/views/delegue-dashboard-view";

export default async function DelegueDashboardPage() {
    const user = await getCurrentUser();

    return (
        <DelegueDashboardView
            userId={user!.id}
            userName={user!.name}
            classeId={user!.classeId}
        />
    );
}
