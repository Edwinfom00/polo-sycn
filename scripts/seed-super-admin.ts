import 'dotenv/config';
import { db } from '../src/db';
import { user } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../src/lib/auth';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@polosync.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@2024!';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Administrateur';

async function seedSuperAdmin() {
    try {
        console.log('🔍 Vérification de l\'existence du Super Admin...');

        // Vérifier si le Super Admin existe déjà
        const existingUser = await db
            .select()
            .from(user)
            .where(eq(user.email, SUPER_ADMIN_EMAIL))
            .limit(1);

        if (existingUser.length > 0) {
            console.log('✅ Super Admin existe déjà:', SUPER_ADMIN_EMAIL);
            console.log('⚠️  Si vous voulez recréer le compte, supprimez-le d\'abord de la base de données');
            return;
        }

        console.log('🚀 Création du Super Admin via BetterAuth API...');

        // Utiliser l'API BetterAuth pour créer l'utilisateur avec le bon hash
        const result = await auth.api.signUpEmail({
            body: {
                email: SUPER_ADMIN_EMAIL,
                password: SUPER_ADMIN_PASSWORD,
                name: SUPER_ADMIN_NAME,
            }
        });

        if (!result) {
            throw new Error('Échec de la création du compte');
        }

        // Mettre à jour le rôle et vérifier l'email
        await db
            .update(user)
            .set({
                role: 'SUPER_ADMIN',
                emailVerified: true,
            })
            .where(eq(user.email, SUPER_ADMIN_EMAIL));

        console.log('✅ Super Admin créé avec succès!');
        console.log('📧 Email:', SUPER_ADMIN_EMAIL);
        console.log('🔑 Mot de passe:', SUPER_ADMIN_PASSWORD);
        console.log('⚠️  Changez le mot de passe après la première connexion!');
    } catch (error) {
        console.error('❌ Erreur lors de la création du Super Admin:', error);
        throw error;
    }
}

seedSuperAdmin()
    .then(() => {
        console.log('✅ Seed terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
