import { getStocks } from "@/modules/produits/actions";
import { AdminStockView } from "@/modules/admin/ui/views/admin-stock-view";

export default async function AdminStockPage() {
    const result = await getStocks();

    return (
        <AdminStockView
            stocks={result.data?.stocks || []}
        />
    );
}
