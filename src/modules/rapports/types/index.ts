export interface RapportComplet {
    periode: {
        debut: Date;
        fin: Date;
    };
    commandes: {
        total: number;
        parStatut: Array<{
            statut: string;
            count: number;
            montant: number;
        }>;
        montants: {
            total: number;
            paye: number;
            impaye: number;
        };
        evolution: Array<{
            date: string;
            count: number;
            montant: number;
        }>;
    };
    paiements: {
        total: number;
        montant: number;
        parMethode: Array<{
            methode: string;
            count: number;
            montant: number;
        }>;
        evolution: Array<{
            date: string;
            count: number;
            montant: number;
        }>;
    };
    livraisons: {
        total: number;
    };
    stock: {
        disponible: number;
        reserve: number;
        livre: number;
        faible: number;
        parProduit: Array<{
            produit: string;
            disponible: number;
            reserve: number;
            livre: number;
        }>;
    };
    sorties: {
        total: number;
        quantite: number;
        parType: Array<{
            type: string;
            count: number;
            quantite: number;
        }>;
    };
    utilisateurs: {
        etudiants: number;
        classes: number;
    };
    topProduits: Array<{
        nom: string;
        quantite: number;
        commandes: number;
        montant: number;
    }>;
    performanceClasses: Array<{
        nom: string;
        code: string;
        filiere: string;
        commandes: number;
        montantTotal: number;
        montantPaye: number;
        etudiants: number;
        tauxPaiement: number;
        moyenneParEtudiant: number;
    }>;
}

export interface RapportFilters {
    dateDebut?: Date;
    dateFin?: Date;
    classeId?: string;
    filiereId?: string;
    type?: string;
}
