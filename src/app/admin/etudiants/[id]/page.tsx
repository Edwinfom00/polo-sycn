import { getEtudiantDetail } from "@/modules/users/actions/etudiants";
import { AdminEtudiantDetailView } from "@/modules/admin/ui/views/admin-etudiant-detail-view";
import { redirect } from "next/navigation";

export default async function AdminEtudiantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const result = await getEtudiantDetail(id);

    if (!result.success || !result.data) {
        redirect('/admin/etudiants');
    }

    return (
        <AdminEtudiantDetailView
            etudiant={result.data.etudiant}
            commandes={result.data.commandes}
        />
    );
}
