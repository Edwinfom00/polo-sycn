import { requireRole } from "@/lib/auth-utils";
import { USER_ROLES } from "@/lib/constants/roles";
import { ClassesView } from "@/modules/classes/ui/views/classes-view";
import { getFilieres, getClasses, getClasseStats, getDelegues } from "@/modules/classes/actions";

export default async function ClassesPage() {
    await requireRole(USER_ROLES.ADMIN);

    const filieres = await getFilieres();
    const classes = await getClasses();
    const stats = await getClasseStats();
    const delegues = await getDelegues();

    return (
        <ClassesView
            initialFilieres={filieres}
            initialClasses={classes}
            stats={stats}
            delegues={delegues}
        />
    );
}
