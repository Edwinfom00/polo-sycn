import { getSorties, getSortieStats } from "@/modules/sorties/actions";
import { getStocks } from "@/modules/produits/actions";
import { SortiesViewPro } from "@/modules/sorties/ui/views/sorties-view-pro";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function SortiesPage() {
    const [sortiesResult, statsResult, stocksResult, currentUser] = await Promise.all([
        getSorties({ limit: 50 }),
        getSortieStats(),
        getStocks({ limit: 1000 }),
        getCurrentUser(),
    ]);

    const stocks = stocksResult.success && stocksResult.data ? stocksResult.data.stocks : [];

    return (
        <SortiesViewPro
            initialData={sortiesResult}
            stats={statsResult}
            stocks={stocks}
            userRole={currentUser?.role}
        />
    );
}
