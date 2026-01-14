import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { UsersView } from "@/modules/admin/ui/views/users-view";

export default async function UsersPage() {
    await requireRole(USER_ROLES.ADMIN);

    return <UsersView />;
}
