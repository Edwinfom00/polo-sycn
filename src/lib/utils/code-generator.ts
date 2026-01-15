/**
 * Génère un code à partir d'un nom
 * Exemples:
 * - "Informatique" -> "INFO"
 * - "Gestion des Entreprises" -> "GEST"
 * - "Droit Public" -> "DROIT"
 * - "Informatique L1 - Groupe A" -> "INFO-L1-A"
 */
export function generateCode(name: string): string {
    if (!name || name.trim().length === 0) {
        return '';
    }

    // Nettoyer le nom
    const cleaned = name
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Retirer les accents

    // Séparer par espaces, tirets, etc.
    const words = cleaned.split(/[\s\-_]+/).filter(word => word.length > 0);

    if (words.length === 0) {
        return '';
    }

    // Si un seul mot
    if (words.length === 1) {
        const word = words[0];
        // Prendre les 4-5 premières lettres
        return word.length <= 5 ? word : word.substring(0, 4);
    }

    // Si plusieurs mots
    let code = '';

    // Identifier les mots importants (pas "de", "des", "et", etc.)
    const stopWords = ['DE', 'DES', 'DU', 'LA', 'LE', 'LES', 'ET', 'OU', 'POUR', 'AVEC'];
    const importantWords = words.filter(word => !stopWords.includes(word));

    // Si on a des mots importants
    if (importantWords.length > 0) {
        // Cas spécial : si on a des niveaux (L1, L2, M1, etc.) ou groupes (A, B, C)
        const hasLevel = words.some(w => /^[LM]\d+$/.test(w));
        const hasGroup = words.some(w => /^[A-Z]$/.test(w) && w !== words[0]);

        if (hasLevel || hasGroup) {
            // Pour les classes : "Informatique L1 - Groupe A" -> "INFO-L1-A"
            const mainWord = importantWords[0];
            const level = words.find(w => /^[LM]\d+$/.test(w));
            const group = words.find(w => /^[A-Z]$/.test(w) && w !== mainWord);

            code = mainWord.length <= 5 ? mainWord : mainWord.substring(0, 4);
            if (level) code += `-${level}`;
            if (group) code += `-${group}`;
        } else {
            // Pour les filières : prendre les premières lettres des mots importants
            if (importantWords.length === 1) {
                const word = importantWords[0];
                code = word.length <= 5 ? word : word.substring(0, 4);
            } else if (importantWords.length === 2) {
                // "Gestion Entreprises" -> "GEST"
                code = importantWords[0].substring(0, 4);
            } else {
                // "Sciences Politiques Internationales" -> "SPI"
                code = importantWords.map(w => w[0]).join('').substring(0, 4);
            }
        }
    } else {
        // Fallback : prendre les premières lettres de tous les mots
        code = words.map(w => w[0]).join('').substring(0, 4);
    }

    return code;
}

/**
 * Génère un code pour une filière
 */
export function generateFiliereCode(nom: string): string {
    return generateCode(nom);
}

/**
 * Génère un code pour une classe
 */
export function generateClasseCode(nom: string): string {
    return generateCode(nom);
}
