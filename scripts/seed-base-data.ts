import 'dotenv/config';
import { db } from '../src/db';
import { taille, couleur, produit, filiere } from '../src/db/schema';

async function seedBaseData() {
    try {
        console.log('🌱 Seed des données de base...\n');

        // 1. TAILLES
        console.log('📏 Création des tailles...');
        const tailles = [
            { nom: 'XS', ordre: 1 },
            { nom: 'S', ordre: 2 },
            { nom: 'M', ordre: 3 },
            { nom: 'L', ordre: 4 },
            { nom: 'XL', ordre: 5 },
            { nom: 'XXL', ordre: 6 },
            { nom: '3XL', ordre: 7 },
        ];

        for (const t of tailles) {
            await db.insert(taille).values({
                id: crypto.randomUUID(),
                nom: t.nom,
                ordre: t.ordre,
                actif: true,
                createdAt: new Date(),
            }).onConflictDoNothing();
        }
        console.log('✅ Tailles créées\n');

        // 2. COULEURS
        console.log('🎨 Création des couleurs...');
        const couleurs = [
            { nom: 'Noir', codeHex: '#000000' },
            { nom: 'Blanc', codeHex: '#FFFFFF' },
            { nom: 'Bleu Marine', codeHex: '#001F3F' },
            { nom: 'Bleu Royal', codeHex: '#0074D9' },
            { nom: 'Rouge', codeHex: '#FF4136' },
            { nom: 'Vert', codeHex: '#2ECC40' },
            { nom: 'Jaune', codeHex: '#FFDC00' },
            { nom: 'Gris', codeHex: '#AAAAAA' },
            { nom: 'Bordeaux', codeHex: '#85144B' },
        ];

        for (const c of couleurs) {
            await db.insert(couleur).values({
                id: crypto.randomUUID(),
                nom: c.nom,
                codeHex: c.codeHex,
                actif: true,
                createdAt: new Date(),
            }).onConflictDoNothing();
        }
        console.log('✅ Couleurs créées\n');

        // 3. PRODUITS
        console.log('👕 Création des produits...');
        const produits = [
            {
                nom: 'Polo Classique',
                description: 'Polo classique en coton, logo brodé',
                prixUnitaire: '25.00'
            },
            {
                nom: 'Polo Premium',
                description: 'Polo premium en coton peigné, finitions haut de gamme',
                prixUnitaire: '35.00'
            },
        ];

        for (const p of produits) {
            await db.insert(produit).values({
                id: crypto.randomUUID(),
                nom: p.nom,
                description: p.description,
                prixUnitaire: p.prixUnitaire,
                actif: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).onConflictDoNothing();
        }
        console.log('✅ Produits créés\n');

        // 4. FILIÈRES (exemples)
        console.log('🎓 Création des filières...');
        const filieres = [
            {
                nom: 'Informatique',
                code: 'INFO',
                description: 'Licence et Master en Informatique'
            },
            {
                nom: 'Gestion',
                code: 'GEST',
                description: 'Licence et Master en Gestion'
            },
            {
                nom: 'Droit',
                code: 'DROIT',
                description: 'Licence et Master en Droit'
            },
        ];

        for (const f of filieres) {
            await db.insert(filiere).values({
                id: crypto.randomUUID(),
                nom: f.nom,
                code: f.code,
                description: f.description,
                actif: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).onConflictDoNothing();
        }
        console.log('✅ Filières créées\n');

        console.log('✅ Seed des données de base terminé!');
        console.log('\n📊 Résumé:');
        console.log(`   - ${tailles.length} tailles`);
        console.log(`   - ${couleurs.length} couleurs`);
        console.log(`   - ${produits.length} produits`);
        console.log(`   - ${filieres.length} filières`);
    } catch (error) {
        console.error('❌ Erreur lors du seed:', error);
        throw error;
    }
}

seedBaseData()
    .then(() => {
        console.log('\n✅ Seed terminé');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
