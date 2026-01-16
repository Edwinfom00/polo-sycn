import { getEtudiants } from "@/modules/users/actions/etudiants";
import { AdminEtudiantsView } from "@/modules/admin/ui/views/admin-etudiants-view";

export default async function AdminEtudiantsPage() {
    const result = await getEtudiants();

    return (
        <AdminEtudiantsView
            etudiants={result.data?.etudiants || []}
            isSuperAdmin={false}
        />
    );
}
