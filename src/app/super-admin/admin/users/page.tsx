import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { UsersView } from "@/modules/users/ui/views/users-view";
import { getUsers, getUserStats } from "@/modules/users/actions";

export default async function UsersPage() {
    await requireRole(USER_ROLES.ADMIN);

    const { users } = await getUsers();
    const stats = await getUserStats();

    return <UsersView initialUsers={users} stats={stats} />;
}
