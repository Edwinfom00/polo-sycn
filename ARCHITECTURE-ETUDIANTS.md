# 🎓 Architecture Étudiants - PoloSync

## 📋 Principe de séparation

### Gestion du Personnel (`/admin/users`)
**Qui ?** SUPER_ADMIN, ADMIN, DELEGUE uniquement

**Fonctionnalités :**
- Création manuelle par les administrateurs
- Gestion des rôles et permissions
- Attribution aux classes (pour les délégués)
- Liste et modification du personnel

### Gestion des Étudiants (séparée)
**Qui ?** ETUDIANT

**Flux d'inscription :**
1. **Inscription publique** (`/sign-up`)
   - L'étudiant crée son propre compte
   - Rôle automatique : ETUDIANT
   - Sélection de sa filière et classe
   - Email de vérification (optionnel)

2. **Profil étudiant**
   - Informations personnelles
   - Classe et filière
   - Historique des commandes
   - Statut des paiements

3. **Commandes**
   - Passer une commande de polos
   - Voir ses commandes
   - Suivre les paiements
   - Suivre les livraisons

## 🔄 Flux complet

```
┌─────────────────────────────────────────────────────────────┐
│                    INSCRIPTION PUBLIQUE                      │
│                      (/sign-up)                              │
│                                                              │
│  1. Nom, Email, Mot de passe                                │
│  2. Sélection Filière                                       │
│  3. Sélection Classe                                        │
│  4. Création compte → Rôle: ETUDIANT                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD ÉTUDIANT                        │
│                      (/)                                     │
│                                                              │
│  - Mes informations                                         │
│  - Ma classe                                                │
│  - Passer une commande                                      │
│  - Mes commandes                                            │
│  - Mes paiements                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NOUVELLE COMMANDE                         │
│                      (/orders/new)                           │
│                                                              │
│  1. Sélection produit (Polo Classique/Premium)             │
│  2. Sélection taille (XS → 3XL)                            │
│  3. Sélection couleur                                       │
│  4. Quantité                                                │
│  5. Validation → Statut: EN_ATTENTE                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PAIEMENT                                  │
│                      (/payments)                             │
│                                                              │
│  - Montant à payer                                          │
│  - Méthode de paiement                                      │
│  - Validation manuelle par admin                            │
│  - Commande → Statut: PAYE                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION ADMIN                          │
│                      (/admin/orders)                         │
│                                                              │
│  - Admin valide la commande                                 │
│  - Commande → Statut: VALIDE                                │
│  - Stock réservé                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    LIVRAISON                                 │
│                      (/admin/deliveries)                     │
│                                                              │
│  - Admin enregistre la livraison                            │
│  - Commande → Statut: LIVRE                                 │
│  - Stock mis à jour                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Modules à créer

### 1. Module Étudiants (`/modules/students`)
- **Actions** : getStudents, getStudent, updateStudent
- **Types** : StudentGetOne, StudentWithClasse
- **UI** : Liste des étudiants (pour admin), profil étudiant

### 2. Module Commandes (`/modules/orders`)
- **Actions** : createOrder, updateOrder, validateOrder, getOrders
- **Types** : OrderGetOne, OrderWithDetails
- **UI** : Formulaire commande, liste commandes, détails

### 3. Module Paiements (`/modules/payments`)
- **Actions** : createPayment, validatePayment, getPayments
- **Types** : PaymentGetOne, PaymentWithOrder
- **UI** : Enregistrement paiement, validation, historique

### 4. Module Livraisons (`/modules/deliveries`)
- **Actions** : createDelivery, getDeliveries
- **Types** : DeliveryGetOne, DeliveryWithOrder
- **UI** : Enregistrement livraison, liste

## 🎯 Prochaines étapes

1. ✅ Modifier sign-up pour inclure sélection filière/classe
2. ✅ Créer module students (vue admin)
3. ✅ Créer module orders (étudiant + admin)
4. ✅ Créer module payments
5. ✅ Créer module deliveries
6. ✅ Dashboards adaptés par rôle

## 🔐 Permissions

| Action | ETUDIANT | DELEGUE | ADMIN | SUPER_ADMIN |
|--------|----------|---------|-------|-------------|
| S'inscrire | ✅ | ❌ | ❌ | ❌ |
| Passer commande | ✅ | ✅ | ✅ | ✅ |
| Voir ses commandes | ✅ | ✅ | ✅ | ✅ |
| Voir toutes commandes | ❌ | Classe | ✅ | ✅ |
| Valider commande | ❌ | ❌ | ✅ | ✅ |
| Valider paiement | ❌ | ❌ | ✅ | ✅ |
| Enregistrer livraison | ❌ | ❌ | ✅ | ✅ |
| Gérer stock | ❌ | ❌ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ | ✅ |
