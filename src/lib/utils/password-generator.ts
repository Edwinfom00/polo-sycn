/**
 * Génère un mot de passe aléatoire sécurisé
 * @param length - Longueur du mot de passe (par défaut 12)
 * @returns Un mot de passe aléatoire
 */
export function generatePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Assurer au moins un caractère de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Remplir le reste
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Copie du texte dans le presse-papiers
 * @param text - Texte à copier
 * @returns Promise<boolean> - true si succès, false sinon
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback pour les navigateurs plus anciens
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Failed to copy:', fallbackError);
            return false;
        }
    }
}
