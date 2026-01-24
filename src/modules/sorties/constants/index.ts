export const SORTIE_TYPE_LABELS: Record<string, string> = {
    VENTE: 'Vente',
    CONSOMMATION_INTERNE: 'Consommation interne',
    DEMARQUE_CASSE: 'Démarque - Casse',
    DEMARQUE_VOL: 'Démarque - Vol/Perte',
    DEMARQUE_PEREMPTION: 'Démarque - Péremption',
    DEMARQUE_OBSOLESCENCE: 'Démarque - Obsolescence',
    TRANSFERT: 'Transfert inter-dépôts',
    RETOUR_FOURNISSEUR: 'Retour fournisseur',
    AJUSTEMENT_INVENTAIRE: 'Ajustement d\'inventaire',
    ECHANTILLON: 'Échantillon/Don',
    AUTRE: 'Autre',
};

export const SORTIE_TYPE_COLORS: Record<string, string> = {
    VENTE: 'bg-green-500',
    CONSOMMATION_INTERNE: 'bg-blue-500',
    DEMARQUE_CASSE: 'bg-orange-500',
    DEMARQUE_VOL: 'bg-red-500',
    DEMARQUE_PEREMPTION: 'bg-red-600',
    DEMARQUE_OBSOLESCENCE: 'bg-gray-500',
    TRANSFERT: 'bg-purple-500',
    RETOUR_FOURNISSEUR: 'bg-yellow-500',
    AJUSTEMENT_INVENTAIRE: 'bg-indigo-500',
    ECHANTILLON: 'bg-pink-500',
    AUTRE: 'bg-gray-400',
};

export const SORTIE_TYPE_DESCRIPTIONS: Record<string, string> = {
    VENTE: 'Sortie pour vente client (via commande)',
    CONSOMMATION_INTERNE: 'Utilisation interne (production, échantillons, etc.)',
    DEMARQUE_CASSE: 'Produit cassé ou détérioré',
    DEMARQUE_VOL: 'Vol, perte ou disparition',
    DEMARQUE_PEREMPTION: 'Produit périmé (DLC dépassée)',
    DEMARQUE_OBSOLESCENCE: 'Produit obsolète ou démodé',
    TRANSFERT: 'Transfert vers un autre dépôt/entrepôt',
    RETOUR_FOURNISSEUR: 'Retour de marchandise défectueuse au fournisseur',
    AJUSTEMENT_INVENTAIRE: 'Correction suite à inventaire physique',
    ECHANTILLON: 'Échantillon gratuit ou don',
    AUTRE: 'Autre motif de sortie',
};

export const METHODE_VALORISATION_LABELS: Record<string, string> = {
    FIFO: 'FIFO/PEPS (Premier Entré, Premier Sorti)',
    FEFO: 'FEFO (Premier Expiré, Premier Sorti)',
    CMUP: 'CMUP (Coût Moyen Unitaire Pondéré)',
    PRIX_SPECIFIQUE: 'Prix Spécifique',
};

export const METHODE_VALORISATION_DESCRIPTIONS: Record<string, string> = {
    FIFO: 'Les produits les plus anciens sortent en premier. Idéal pour éviter la péremption.',
    FEFO: 'Priorité aux produits dont la date limite est la plus proche. Recommandé pour les produits périssables.',
    CMUP: 'Valorisation au coût moyen des stocks restants. Lisse les variations de prix.',
    PRIX_SPECIFIQUE: 'Permet de spécifier un coût unitaire manuel pour chaque ligne.',
};

// Catégories de sorties pour filtrage
export const SORTIE_CATEGORIES = {
    COMMERCIALE: ['VENTE'],
    DEMARQUE: ['DEMARQUE_CASSE', 'DEMARQUE_VOL', 'DEMARQUE_PEREMPTION', 'DEMARQUE_OBSOLESCENCE'],
    LOGISTIQUE: ['TRANSFERT', 'RETOUR_FOURNISSEUR'],
    ADMINISTRATIVE: ['CONSOMMATION_INTERNE', 'AJUSTEMENT_INVENTAIRE', 'ECHANTILLON', 'AUTRE'],
};

// Types nécessitant une validation
export const TYPES_NECESSITANT_VALIDATION = [
    'DEMARQUE_VOL',
    'AJUSTEMENT_INVENTAIRE',
    'RETOUR_FOURNISSEUR',
];

// Types nécessitant une destination
export const TYPES_AVEC_DESTINATION = ['TRANSFERT'];

// Types nécessitant une référence externe
export const TYPES_AVEC_REFERENCE = ['RETOUR_FOURNISSEUR', 'TRANSFERT'];
