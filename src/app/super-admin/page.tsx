import { getCurrentUser } from "@/lib/auth-utils";
import { MainDashboardView } from "@/modules/dashboard/ui/views/main-dashboard-view";

export default async function SuperAdminDashboardPage() {
    const user = await getCurrentUser();

    return (
        <MainDashboardView
            userRole={user!.role}
            userName={user!.name}
        />
    );
}
