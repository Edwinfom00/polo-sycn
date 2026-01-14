import 'dotenv/config';
import { db } from '../src/db';
import { user, account } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@polosync.com';

async function resetSuperAdmin() {
    try {
        console.log('🗑️  Suppression de l\'ancien Super Admin...');

        // Trouver l'utilisateur
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, SUPER_ADMIN_EMAIL))
            .limit(1);

        if (existingUser.length === 0) {
            console.log('ℹ️  Aucun Super Admin trouvé avec cet email');
            return;
        }

        const userId = existingUser[0].id;

        // Supprimer les comptes associés
        await db.delete(account).where(eq(account.userId, userId));
        console.log('✅ Comptes supprimés');

        // Supprimer l'utilisateur
        await db.delete(user).where(eq(user.id, userId));
        console.log('✅ Utilisateur supprimé');

        console.log('✅ Super Admin supprimé avec succès!');
        console.log('💡 Vous pouvez maintenant exécuter: npm run seed:admin');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
    }
}

resetSuperAdmin()
    .then(() => {
        console.log('✅ Reset terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
