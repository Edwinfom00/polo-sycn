import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { getCurrentUser } from "@/lib/auth-utils";
import { CommandesView } from "@/modules/commandes/ui/views/commandes-view";

export default async function CommandesPage() {
    await requireRole(USER_ROLES.ADMIN);
    const user = await getCurrentUser();

    return <CommandesView userRole={user!.role} />;
}
