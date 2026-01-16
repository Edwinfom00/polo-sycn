import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
    user,
    account,
    session,
    verification,
    commande,
    ligneCommande,
    ligneLivraison,
    paiement,
    livraison,
    stock,
    produit,
    taille,
    couleur,
    classe,
    filiere,
} from "../src/db/schema";
import { eq, ne } from "drizzle-orm";
import * as readline from "readline";

// Vérifier que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL n'est pas défini dans le fichier .env");
    process.exit(1);
}

// Créer la connexion à la base de données
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function cleanDatabase() {
    try {
        console.log("\n⚠️  ========================================");
        console.log("⚠️  ATTENTION: NETTOYAGE DE LA BASE DE DONNÉES");
        console.log("⚠️  ========================================\n");
        console.log("Ce script va supprimer TOUTES les données SAUF le super admin:");
        console.log("  - Tous les utilisateurs (étudiants, admins, délégués)");
        console.log("  - Toutes les commandes et lignes de commande");
        console.log("  - Tous les paiements");
        console.log("  - Toutes les livraisons");
        console.log("  - Tout le stock");
        console.log("  - Tous les produits, tailles et couleurs");
        console.log("  - Toutes les classes et filières");
        console.log("\n⚠️  CETTE ACTION EST IRRÉVERSIBLE!\n");

        // 1. Récupérer le super admin
        const superAdmins = await db
            .select()
            .from(user)
            .where(eq(user.role, "SUPER_ADMIN"));

        if (superAdmins.length === 0) {
            console.error("❌ Aucun super admin trouvé! Arrêt du script.");
            rl.close();
            process.exit(1);
        }

        console.log(`✅ Super admin qui sera conservé: ${superAdmins[0].name} (${superAdmins[0].email})\n`);

        // Demander confirmation
        const answer1 = await askQuestion("Tapez 'OUI' en majuscules pour continuer: ");
        if (answer1 !== "OUI") {
            console.log("\n❌ Opération annulée.");
            rl.close();
            process.exit(0);
        }

        const answer2 = await askQuestion("\nÊtes-vous ABSOLUMENT sûr? Tapez 'SUPPRIMER' pour confirmer: ");
        if (answer2 !== "SUPPRIMER") {
            console.log("\n❌ Opération annulée.");
            rl.close();
            process.exit(0);
        }

        console.log("\n🧹 Début du nettoyage...\n");

        const superAdminId = superAdmins[0].id;

        // 2. Supprimer les lignes de livraison (dépendent des lignes de commande)
        console.log("🗑️  Suppression des lignes de livraison...");
        await db.delete(ligneLivraison);
        console.log("✅ Lignes de livraison supprimées");

        // 3. Supprimer les livraisons
        console.log("🗑️  Suppression des livraisons...");
        await db.delete(livraison);
        console.log("✅ Livraisons supprimées");

        // 4. Supprimer les lignes de commande
        console.log("🗑️  Suppression des lignes de commande...");
        await db.delete(ligneCommande);
        console.log("✅ Lignes de commande supprimées");

        // 5. Supprimer les paiements
        console.log("🗑️  Suppression des paiements...");
        await db.delete(paiement);
        console.log("✅ Paiements supprimés");

        // 6. Supprimer les commandes
        console.log("🗑️  Suppression des commandes...");
        await db.delete(commande);
        console.log("✅ Commandes supprimées");

        // 7. Supprimer le stock
        console.log("🗑️  Suppression du stock...");
        await db.delete(stock);
        console.log("✅ Stock supprimé");

        // 8. Supprimer les produits
        console.log("🗑️  Suppression des produits...");
        await db.delete(produit);
        console.log("✅ Produits supprimés");

        // 9. Supprimer les tailles
        console.log("🗑️  Suppression des tailles...");
        await db.delete(taille);
        console.log("✅ Tailles supprimées");

        // 10. Supprimer les couleurs
        console.log("🗑️  Suppression des couleurs...");
        await db.delete(couleur);
        console.log("✅ Couleurs supprimées");

        // 11. Supprimer les classes
        console.log("🗑️  Suppression des classes...");
        await db.delete(classe);
        console.log("✅ Classes supprimées");

        // 12. Supprimer les filières
        console.log("🗑️  Suppression des filières...");
        await db.delete(filiere);
        console.log("✅ Filières supprimées");

        // 13. Supprimer les sessions (sauf celles du super admin)
        console.log("🗑️  Suppression des sessions...");
        await db.delete(session).where(ne(session.userId, superAdminId));
        console.log("✅ Sessions supprimées");

        // 14. Supprimer les verifications
        console.log("🗑️  Suppression des vérifications...");
        await db.delete(verification);
        console.log("✅ Vérifications supprimées");

        // 15. Supprimer les comptes (sauf ceux du super admin)
        console.log("🗑️  Suppression des comptes...");
        await db.delete(account).where(ne(account.userId, superAdminId));
        console.log("✅ Comptes supprimés");

        // 16. Supprimer tous les utilisateurs sauf le super admin
        console.log("🗑️  Suppression des utilisateurs (sauf super admin)...");
        await db.delete(user).where(ne(user.id, superAdminId));
        console.log("✅ Utilisateurs supprimés");

        console.log("\n✨ Base de données nettoyée avec succès!");
        console.log(`📌 Super admin conservé: ${superAdmins[0].email}`);
        console.log("\n🎉 La base de données est prête pour la production!\n");

        rl.close();
    } catch (error) {
        console.error("\n❌ Erreur lors du nettoyage:", error);
        rl.close();
        process.exit(1);
    }
}

// Exécuter le script
cleanDatabase()
    .then(() => {
        console.log("✅ Script terminé avec succès");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Erreur fatale:", error);
        process.exit(1);
    });
