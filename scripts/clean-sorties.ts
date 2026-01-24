import 'dotenv/config';
import { db } from '../src/db';
import { sortieStock, ligneSortieStock } from '../src/db/schema';

async function cleanSorties() {
    try {
        console.log('🗑️  Suppression des sorties existantes...');

        // Supprimer toutes les sorties (les lignes seront supprimées en cascade)
        await db.delete(sortieStock);

        console.log('✅ Sorties supprimées avec succès!');
        console.log('💡 Vous pouvez maintenant appliquer la migration: npm run db:push');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
    }
}

cleanSorties()
    .then(() => {
        console.log('✅ Nettoyage terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
