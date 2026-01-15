export interface FiliereGetOne {
    id: string;
    nom: string;
    code: string;
    description?: string | null;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClasseGetOne {
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

export interface ClasseWithFiliere extends ClasseGetOne {
    filiere?: FiliereGetOne;
    delegue?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface ClasseStats {
    totalClasses: number;
    totalFilieres: number;
    classesActives: number;
}
