import { getCurrentUser } from "@/lib/auth-utils";
import { AdminDashboardView } from "@/modules/admin/ui/views/admin-dashboard-view";
import { getAdminDashboardStats } from "@/modules/dashboard/actions/admin-stats";

export default async function AdminDashboardPage() {
    const user = await getCurrentUser();
    const statsResult = await getAdminDashboardStats();

    return (
        <AdminDashboardView
            userId={user!.id}
            userName={user!.name}
            userRole={user!.role}
            initialStats={statsResult.data || null}
        />
    );
}
