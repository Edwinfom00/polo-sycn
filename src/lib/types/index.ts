// Types pour les rôles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DELEGUE' | 'ETUDIANT';

// Types pour les statuts
export type OrderStatus = 'EN_ATTENTE' | 'PAYE' | 'VALIDE' | 'LIVRE' | 'ANNULE';
export type PaymentStatus = 'EN_ATTENTE' | 'PAYE' | 'REMBOURSE';

// Types pour les entités
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    classeId?: string | null;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Filiere {
    id: string;
    nom: string;
    code: string;
    description?: string | null;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Classe {
    id: string;
    nom: string;
    code: string;
    niveau: string;
    filiereId: string;
    delegueId?: string | null;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Produit {
    id: string;
    nom: string;
    description?: string | null;
    prixUnitaire: string;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Taille {
    id: string;
    nom: string;
    ordre: number;
    actif: boolean;
    createdAt: Date;
}

export interface Couleur {
    id: string;
    nom: string;
    codeHex?: string | null;
    actif: boolean;
    createdAt: Date;
}

export interface Stock {
    id: string;
    produitId: string;
    tailleId: string;
    couleurId: string;
    quantiteDisponible: number;
    quantiteReservee: number;
    quantiteLivree: number;
    seuilAlerte: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Commande {
    id: string;
    numero: string;
    etudiantId: string;
    classeId: string;
    statut: OrderStatus;
    montantTotal: string;
    montantPaye: string;
    validePar?: string | null;
    valideAt?: Date | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
