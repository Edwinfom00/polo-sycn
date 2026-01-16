import { getCurrentUser } from "@/lib/auth-utils";
import { EtudiantProfilView } from "@/modules/etudiant/ui/views/etudiant-profil-view";
import { db } from "@/db";
import { classe, filiere } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function EtudiantProfilPage() {
    const user = await getCurrentUser();

    let classeInfo = null;
    if (user?.classeId) {
        const result = await db
            .select({
                classe: classe,
                filiere: filiere,
            })
            .from(classe)
            .leftJoin(filiere, eq(classe.filiereId, filiere.id))
            .where(eq(classe.id, user.classeId))
            .limit(1);

        if (result.length > 0) {
            classeInfo = {
                ...result[0].classe,
                filiere: result[0].filiere,
            };
        }
    }

    return (
        <EtudiantProfilView
            user={user!}
            classeInfo={classeInfo}
        />
    );
}
