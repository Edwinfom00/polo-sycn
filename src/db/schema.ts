import { pgTable, text, timestamp, boolean, pgEnum, integer, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'ADMIN', 'DELEGUE', 'ETUDIANT']);
export const orderStatusEnum = pgEnum('order_status', ['EN_ATTENTE', 'PAYE', 'VALIDE', 'LIVRE', 'ANNULE']);
export const paymentStatusEnum = pgEnum('payment_status', ['EN_ATTENTE', 'PAYE', 'REMBOURSE']);
export const sortieTypeEnum = pgEnum('sortie_type', [
    'VENTE',                    // Vente client (via commande)
    'CONSOMMATION_INTERNE',     // Utilisation interne
    'DEMARQUE_CASSE',           // Casse/Détérioration
    'DEMARQUE_VOL',             // Vol/Perte
    'DEMARQUE_PEREMPTION',      // Produit périmé
    'DEMARQUE_OBSOLESCENCE',    // Produit obsolète
    'TRANSFERT',                // Transfert entre dépôts
    'RETOUR_FOURNISSEUR',       // Retour au fournisseur
    'AJUSTEMENT_INVENTAIRE',    // Correction d'inventaire
    'ECHANTILLON',              // Échantillon/Don
    'AUTRE'                     // Autre motif
]);
export const methodeValorisationEnum = pgEnum('methode_valorisation', ['FIFO', 'FEFO', 'CMUP', 'PRIX_SPECIFIQUE']);

// ============================================
// AUTHENTIFICATION (BetterAuth)
// ============================================

export const user = pgTable("user", {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
    image: text('image'),
    role: userRoleEnum('role').$defaultFn(() => 'ETUDIANT').notNull(),

    // Relations métier (référence sans foreign key pour éviter la circularité)
    classeId: text('classe_id'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

// ============================================
// STRUCTURE ACADÉMIQUE
// ============================================

export const filiere = pgTable("filiere", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    code: text('code').notNull().unique(),
    description: text('description'),
    actif: boolean('actif').$defaultFn(() => true).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const classe = pgTable("classe", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    code: text('code').notNull().unique(),
    niveau: text('niveau').notNull(), // L1, L2, L3, M1, M2, etc.
    filiereId: text('filiere_id').notNull().references(() => filiere.id, { onDelete: 'cascade' }),
    delegueId: text('delegue_id'),
    actif: boolean('actif').$defaultFn(() => true).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// PRODUITS & STOCK
// ============================================

export const produit = pgTable("produit", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull(),
    description: text('description'),
    prixUnitaire: decimal('prix_unitaire', { precision: 10, scale: 2 }).notNull(),
    actif: boolean('actif').$defaultFn(() => true).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const taille = pgTable("taille", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull().unique(), // XS, S, M, L, XL, XXL, etc.
    ordre: integer('ordre').notNull(), // Pour le tri
    actif: boolean('actif').$defaultFn(() => true).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const couleur = pgTable("couleur", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nom: text('nom').notNull().unique(),
    codeHex: text('code_hex'), // #FFFFFF
    actif: boolean('actif').$defaultFn(() => true).notNull(),
    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const stock = pgTable("stock", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    produitId: text('produit_id').notNull().references(() => produit.id, { onDelete: 'cascade' }),
    tailleId: text('taille_id').notNull().references(() => taille.id, { onDelete: 'cascade' }),
    couleurId: text('couleur_id').notNull().references(() => couleur.id, { onDelete: 'cascade' }),

    quantiteDisponible: integer('quantite_disponible').$defaultFn(() => 0).notNull(),
    quantiteReservee: integer('quantite_reservee').$defaultFn(() => 0).notNull(),
    quantiteLivree: integer('quantite_livree').$defaultFn(() => 0).notNull(),

    seuilAlerte: integer('seuil_alerte').$defaultFn(() => 10).notNull(),

    // Coût unitaire moyen pondéré (CMUP) - mis à jour à chaque entrée
    coutUnitaireMoyen: decimal('cout_unitaire_moyen', { precision: 10, scale: 2 }).$defaultFn(() => '0').notNull(),

    // Traçabilité (optionnel)
    lotNumero: text('lot_numero'),
    datePeremption: timestamp('date_peremption'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// COMMANDES
// ============================================

export const commande = pgTable("commande", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    numero: text('numero').notNull().unique(), // CMD-2024-0001

    etudiantId: text('etudiant_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    classeId: text('classe_id').notNull().references(() => classe.id, { onDelete: 'restrict' }),

    statut: orderStatusEnum('statut').$defaultFn(() => 'EN_ATTENTE').notNull(),

    montantTotal: decimal('montant_total', { precision: 10, scale: 2 }).notNull(),
    montantPaye: decimal('montant_paye', { precision: 10, scale: 2 }).$defaultFn(() => '0').notNull(),

    validePar: text('valide_par').references(() => user.id, { onDelete: 'set null' }),
    valideAt: timestamp('valide_at'),

    notes: text('notes'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const ligneCommande = pgTable("ligne_commande", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    commandeId: text('commande_id').notNull().references(() => commande.id, { onDelete: 'cascade' }),

    produitId: text('produit_id').notNull().references(() => produit.id, { onDelete: 'restrict' }),
    tailleId: text('taille_id').notNull().references(() => taille.id, { onDelete: 'restrict' }),
    couleurId: text('couleur_id').notNull().references(() => couleur.id, { onDelete: 'restrict' }),

    quantite: integer('quantite').notNull(),
    prixUnitaire: decimal('prix_unitaire', { precision: 10, scale: 2 }).notNull(),
    sousTotal: decimal('sous_total', { precision: 10, scale: 2 }).notNull(),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// PAIEMENTS
// ============================================

export const paiement = pgTable("paiement", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    commandeId: text('commande_id').notNull().references(() => commande.id, { onDelete: 'cascade' }),

    montant: decimal('montant', { precision: 10, scale: 2 }).notNull(),
    statut: paymentStatusEnum('statut').$defaultFn(() => 'EN_ATTENTE').notNull(),

    methodePaiement: text('methode_paiement'), // Espèces, Virement, Carte, etc.
    reference: text('reference'), // Numéro de transaction

    validePar: text('valide_par').references(() => user.id, { onDelete: 'set null' }),
    valideAt: timestamp('valide_at'),

    notes: text('notes'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// LIVRAISONS
// ============================================

export const livraison = pgTable("livraison", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    commandeId: text('commande_id').notNull().references(() => commande.id, { onDelete: 'cascade' }),

    livrePar: text('livre_par').notNull().references(() => user.id, { onDelete: 'restrict' }),
    livreAt: timestamp('livre_at').$defaultFn(() => new Date()).notNull(),

    notes: text('notes'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const ligneLivraison = pgTable("ligne_livraison", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    livraisonId: text('livraison_id').notNull().references(() => livraison.id, { onDelete: 'cascade' }),
    ligneCommandeId: text('ligne_commande_id').notNull().references(() => ligneCommande.id, { onDelete: 'restrict' }),

    quantiteLivree: integer('quantite_livree').notNull(),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// SORTIES DE STOCK
// ============================================

export const sortieStock = pgTable("sortie_stock", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    numero: text('numero').notNull().unique(), // SOR-2026-0001

    type: sortieTypeEnum('type').notNull(),
    motif: text('motif').notNull(),

    // Méthode de valorisation utilisée
    methodeValorisation: methodeValorisationEnum('methode_valorisation').$defaultFn(() => 'FIFO').notNull(),

    // Destination (pour transferts)
    destinationDepot: text('destination_depot'),

    // Référence externe (bon de retour, numéro de transfert, etc.)
    referenceExterne: text('reference_externe'),

    // Coût total de la sortie (calculé selon méthode de valorisation)
    coutTotal: decimal('cout_total', { precision: 10, scale: 2 }).$defaultFn(() => '0').notNull(),

    effectuePar: text('effectue_par').notNull().references(() => user.id, { onDelete: 'restrict' }),
    effectueAt: timestamp('effectue_at').$defaultFn(() => new Date()).notNull(),

    // Validation (pour sorties importantes)
    validePar: text('valide_par').references(() => user.id, { onDelete: 'set null' }),
    valideAt: timestamp('valide_at'),

    notes: text('notes'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const ligneSortieStock = pgTable("ligne_sortie_stock", {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    sortieId: text('sortie_id').notNull().references(() => sortieStock.id, { onDelete: 'cascade' }),

    stockId: text('stock_id').notNull().references(() => stock.id, { onDelete: 'restrict' }),
    quantite: integer('quantite').notNull(),

    // Coût unitaire au moment de la sortie (selon méthode de valorisation)
    coutUnitaire: decimal('cout_unitaire', { precision: 10, scale: 2 }).notNull(),
    coutTotal: decimal('cout_total', { precision: 10, scale: 2 }).notNull(),

    // Traçabilité
    lotNumero: text('lot_numero'),
    datePeremption: timestamp('date_peremption'),

    createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

// ============================================
// RELATIONS (pour Drizzle ORM)
// ============================================

export const userRelations = relations(user, ({ one, many }) => ({
    classe: one(classe, {
        fields: [user.classeId],
        references: [classe.id]
    }),
    commandes: many(commande),
}));

export const filiereRelations = relations(filiere, ({ many }) => ({
    classes: many(classe)
}));

export const classeRelations = relations(classe, ({ one, many }) => ({
    filiere: one(filiere, {
        fields: [classe.filiereId],
        references: [filiere.id]
    }),
    delegue: one(user, {
        fields: [classe.delegueId],
        references: [user.id]
    }),
    etudiants: many(user),
    commandes: many(commande)
}));

export const commandeRelations = relations(commande, ({ one, many }) => ({
    etudiant: one(user, {
        fields: [commande.etudiantId],
        references: [user.id]
    }),
    classe: one(classe, {
        fields: [commande.classeId],
        references: [classe.id]
    }),
    lignes: many(ligneCommande),
    paiements: many(paiement),
    livraisons: many(livraison)
}));

export const stockRelations = relations(stock, ({ one }) => ({
    produit: one(produit, {
        fields: [stock.produitId],
        references: [produit.id]
    }),
    taille: one(taille, {
        fields: [stock.tailleId],
        references: [taille.id]
    }),
    couleur: one(couleur, {
        fields: [stock.couleurId],
        references: [couleur.id]
    })
}));

export const sortieStockRelations = relations(sortieStock, ({ one, many }) => ({
    effectuePar: one(user, {
        fields: [sortieStock.effectuePar],
        references: [user.id]
    }),
    lignes: many(ligneSortieStock)
}));

export const ligneSortieStockRelations = relations(ligneSortieStock, ({ one }) => ({
    sortie: one(sortieStock, {
        fields: [ligneSortieStock.sortieId],
        references: [sortieStock.id]
    }),
    stock: one(stock, {
        fields: [ligneSortieStock.stockId],
        references: [stock.id]
    })
}));
