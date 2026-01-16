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

// Vérifier que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL n'est pas défini dans le fichier .env");
    process.exit(1);
}

// Créer la connexion à la base de données
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function cleanDatabase() {
    try {
        console.log("🧹 Nettoyage de la base de données...\n");

        // 1. Récupérer le super admin
        const superAdmins = await db
            .select()
            .from(user)
            .where(eq(user.role, "SUPER_ADMIN"));

        if (superAdmins.length === 0) {
            console.error("❌ Aucun super admin trouvé! Arrêt du script.");
            process.exit(1);
        }

        const superAdminId = superAdmins[0].id;
        console.log(`✅ Super admin trouvé: ${superAdmins[0].name} (${superAdmins[0].email})\n`);

        // 2. Supprimer les lignes de livraison (dépendent des lignes de commande)
        console.log("🗑️  Suppression des lignes de livraison...");
        await db.delete(ligneLivraison);
        console.log("✅ Lignes de livraison supprimées\n");

        // 3. Supprimer les livraisons
        console.log("🗑️  Suppression des livraisons...");
        await db.delete(livraison);
        console.log("✅ Livraisons supprimées\n");

        // 4. Supprimer les lignes de commande
        console.log("🗑️  Suppression des lignes de commande...");
        await db.delete(ligneCommande);
        console.log("✅ Lignes de commande supprimées\n");

        // 5. Supprimer les paiements
        console.log("🗑️  Suppression des paiements...");
        await db.delete(paiement);
        console.log("✅ Paiements supprimés\n");

        // 6. Supprimer les commandes
        console.log("🗑️  Suppression des commandes...");
        await db.delete(commande);
        console.log("✅ Commandes supprimées\n");

        // 7. Supprimer le stock
        console.log("🗑️  Suppression du stock...");
        await db.delete(stock);
        console.log("✅ Stock supprimé\n");

        // 8. Supprimer les produits
        console.log("🗑️  Suppression des produits...");
        await db.delete(produit);
        console.log("✅ Produits supprimés\n");

        // 9. Supprimer les tailles
        console.log("🗑️  Suppression des tailles...");
        await db.delete(taille);
        console.log("✅ Tailles supprimées\n");

        // 10. Supprimer les couleurs
        console.log("🗑️  Suppression des couleurs...");
        await db.delete(couleur);
        console.log("✅ Couleurs supprimées\n");

        // 11. Supprimer les classes
        console.log("🗑️  Suppression des classes...");
        await db.delete(classe);
        console.log("✅ Classes supprimées\n");

        // 12. Supprimer les filières
        console.log("🗑️  Suppression des filières...");
        await db.delete(filiere);
        console.log("✅ Filières supprimées\n");

        // 13. Supprimer les sessions (sauf celles du super admin)
        console.log("🗑️  Suppression des sessions...");
        await db.delete(session).where(ne(session.userId, superAdminId));
        console.log("✅ Sessions supprimées\n");

        // 14. Supprimer les verifications
        console.log("🗑️  Suppression des vérifications...");
        await db.delete(verification);
        console.log("✅ Vérifications supprimées\n");

        // 15. Supprimer les comptes (sauf ceux du super admin)
        console.log("🗑️  Suppression des comptes...");
        await db.delete(account).where(ne(account.userId, superAdminId));
        console.log("✅ Comptes supprimés\n");

        // 16. Supprimer tous les utilisateurs sauf le super admin
        console.log("🗑️  Suppression des utilisateurs (sauf super admin)...");
        await db.delete(user).where(ne(user.id, superAdminId));
        console.log("✅ Utilisateurs supprimés\n");

        console.log("✨ Base de données nettoyée avec succès!");
        console.log(`📌 Super admin conservé: ${superAdmins[0].email}`);
        console.log("\n🎉 La base de données est prête pour la production!\n");

    } catch (error) {
        console.error("❌ Erreur lors du nettoyage:", error);
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
