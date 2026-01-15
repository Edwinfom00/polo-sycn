"use client";

import { LivraisonGetOne } from "../../types";
import { LivraisonCard } from "./livraison-card";
import { EmptyState } from "@/components/empty-state";

interface LivraisonGridProps {
    livraisons: LivraisonGetOne[];
}

export const LivraisonGrid = ({ livraisons }: LivraisonGridProps) => {
    if (livraisons.length === 0) {
        return (
            <EmptyState
                title="Aucune livraison"
                description="Aucune livraison n'a été effectuée pour le moment"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {livraisons.map((livraison) => (
                <LivraisonCard
                    key={livraison.id}
                    livraison={livraison}
                />
            ))}
        </div>
    );
};
