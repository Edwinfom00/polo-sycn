"use client";

import { PaiementGetOne } from "../../types";
import { PaiementCard } from "./paiement-card";
import { EmptyState } from "@/components/empty-state";

interface PaiementGridProps {
    paiements: PaiementGetOne[];
    onUpdate: () => void;
    userRole: string;
}

export const PaiementGrid = ({ paiements, onUpdate, userRole }: PaiementGridProps) => {
    if (paiements.length === 0) {
        return (
            <EmptyState
                title="Aucun paiement"
                description="Aucun paiement n'a été enregistré pour le moment"
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paiements.map((paiement) => (
                <PaiementCard
                    key={paiement.id}
                    paiement={paiement}
                    onUpdate={onUpdate}
                    userRole={userRole}
                />
            ))}
        </div>
    );
};
