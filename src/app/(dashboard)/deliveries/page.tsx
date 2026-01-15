import { requireAuth, getCurrentUser } from "@/lib/auth-utils";
import { LivraisonsView } from "@/modules/livraisons/ui/views/livraisons-view";

export default async function LivraisonsPage() {
    await requireAuth();
    const user = await getCurrentUser();

    return <LivraisonsView userRole={user!.role} />;
}
