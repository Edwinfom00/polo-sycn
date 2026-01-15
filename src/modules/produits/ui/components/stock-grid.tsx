"use client";

import { StockGetOne } from "../../types";
import { StockCard } from "./stock-card";
import { EmptyState } from "@/components/empty-state";

interface StockGridProps {
    stocks: StockGetOne[];
    onUpdate: () => void;
}

export const StockGrid = ({ stocks, onUpdate }: StockGridProps) => {
    if (stocks.length === 0) {
        return (
            <EmptyState
                title="Aucun stock"
                description="Commencez par créer une entrée de stock pour vos produits"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
                <StockCard
                    key={stock.id}
                    stock={stock}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};
