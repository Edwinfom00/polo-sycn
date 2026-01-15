"use client";

import { ProduitGetOne } from "../../types";
import { ProduitCard } from "./produit-card";
import { EmptyState } from "@/components/empty-state";

interface ProduitGridProps {
    produits: ProduitGetOne[];
    onUpdate: () => void;
}

export const ProduitGrid = ({ produits, onUpdate }: ProduitGridProps) => {
    if (produits.length === 0) {
        return (
            <EmptyState
                title="Aucun produit"
                description="Commencez par créer votre premier produit"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produits.map((produit) => (
                <ProduitCard
                    key={produit.id}
                    produit={produit}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};
