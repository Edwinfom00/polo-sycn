import { getEtudiants } from "@/modules/users/actions/etudiants";
import { getClasses } from "@/modules/classes/actions";
import { AdminEtudiantsView } from "@/modules/admin/ui/views/admin-etudiants-view";

export default async function SuperAdminEtudiantsPage() {
    const [etudiantsResult, classes] = await Promise.all([
        getEtudiants(),
        getClasses(),
    ]);

    return (
        <AdminEtudiantsView
            etudiants={etudiantsResult.data?.etudiants || []}
            classes={classes}
            isSuperAdmin={true}
        />
    );
}
