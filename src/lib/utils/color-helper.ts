/**
 * Dictionnaire des couleurs communes avec leurs codes hex
 */
const COLOR_MAP: Record<string, string> = {
    // Couleurs de base
    'noir': '#000000',
    'black': '#000000',
    'blanc': '#FFFFFF',
    'white': '#FFFFFF',
    'gris': '#808080',
    'gray': '#808080',
    'grey': '#808080',

    // Rouges
    'rouge': '#FF0000',
    'red': '#FF0000',
    'bordeaux': '#800020',
    'burgundy': '#800020',
    'rose': '#FFC0CB',
    'pink': '#FFC0CB',
    'corail': '#FF7F50',
    'coral': '#FF7F50',
    'saumon': '#FA8072',
    'salmon': '#FA8072',
    'cerise': '#DE3163',
    'cherry': '#DE3163',
    'framboise': '#E30B5C',
    'raspberry': '#E30B5C',

    // Bleus
    'bleu': '#0000FF',
    'blue': '#0000FF',
    'marine': '#000080',
    'navy': '#000080',
    'ciel': '#87CEEB',
    'sky': '#87CEEB',
    'turquoise': '#40E0D0',
    'cyan': '#00FFFF',
    'azur': '#007FFF',
    'azure': '#007FFF',
    'cobalt': '#0047AB',
    'indigo': '#4B0082',

    // Verts
    'vert': '#008000',
    'green': '#008000',
    'olive': '#808000',
    'kaki': '#C3B091',
    'khaki': '#C3B091',
    'menthe': '#98FF98',
    'mint': '#98FF98',
    'émeraude': '#50C878',
    'emerald': '#50C878',
    'lime': '#00FF00',
    'sapin': '#0B6623',
    'forest': '#228B22',

    // Jaunes/Oranges
    'jaune': '#FFFF00',
    'yellow': '#FFFF00',
    'or': '#FFD700',
    'gold': '#FFD700',
    'orange': '#FFA500',
    'abricot': '#FBCEB1',
    'apricot': '#FBCEB1',
    'pêche': '#FFE5B4',
    'peach': '#FFE5B4',
    'moutarde': '#FFDB58',
    'mustard': '#FFDB58',
    'citron': '#FFF700',
    'lemon': '#FFF700',

    // Violets/Mauves
    'violet': '#8B00FF',
    'purple': '#800080',
    'mauve': '#E0B0FF',
    'lavande': '#E6E6FA',
    'lavender': '#E6E6FA',
    'prune': '#8E4585',
    'plum': '#DDA0DD',
    'lilas': '#C8A2C8',
    'lilac': '#C8A2C8',
    'magenta': '#FF00FF',
    'fuchsia': '#FF00FF',

    // Marrons/Beiges
    'marron': '#8B4513',
    'brown': '#8B4513',
    'beige': '#F5F5DC',
    'crème': '#FFFDD0',
    'cream': '#FFFDD0',
    'caramel': '#C68E17',
    'chocolat': '#7B3F00',
    'chocolate': '#7B3F00',
    'café': '#6F4E37',
    'coffee': '#6F4E37',
    'taupe': '#483C32',
    'sable': '#C2B280',
    'sand': '#C2B280',

    // Autres
    'argent': '#C0C0C0',
    'silver': '#C0C0C0',
    'bronze': '#CD7F32',
    'cuivre': '#B87333',
    'copper': '#B87333',
};

/**
 * Normalise une chaîne de caractères pour la comparaison
 */
function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Enlève les accents
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Trouve le code couleur hex le plus proche basé sur le nom
 * @param colorName - Nom de la couleur en français ou anglais
 * @returns Code hex de la couleur la plus proche, ou null si aucune correspondance
 */
export function getClosestColorHex(colorName: string): string | null {
    if (!colorName || colorName.trim() === '') {
        return null;
    }

    const normalized = normalizeString(colorName);

    // Recherche exacte d'abord
    if (COLOR_MAP[normalized]) {
        return COLOR_MAP[normalized];
    }

    // Recherche par inclusion (ex: "bleu clair" contient "bleu")
    for (const [key, value] of Object.entries(COLOR_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    // Recherche par similarité (distance de Levenshtein)
    let closestMatch: string | null = null;
    let minDistance = Infinity;

    for (const key of Object.keys(COLOR_MAP)) {
        const distance = levenshteinDistance(normalized, key);

        // Accepter seulement si la distance est raisonnable (max 3 caractères de différence)
        if (distance < minDistance && distance <= 3) {
            minDistance = distance;
            closestMatch = key;
        }
    }

    return closestMatch ? COLOR_MAP[closestMatch] : null;
}

/**
 * Suggère des noms de couleurs basés sur une saisie partielle
 * @param input - Saisie partielle de l'utilisateur
 * @param limit - Nombre maximum de suggestions (défaut: 5)
 * @returns Liste de suggestions
 */
export function suggestColors(input: string, limit: number = 5): string[] {
    if (!input || input.trim() === '') {
        return [];
    }

    const normalized = normalizeString(input);
    const suggestions: Array<{ name: string; score: number }> = [];

    for (const key of Object.keys(COLOR_MAP)) {
        // Commence par la saisie
        if (key.startsWith(normalized)) {
            suggestions.push({ name: key, score: 0 });
        }
        // Contient la saisie
        else if (key.includes(normalized)) {
            suggestions.push({ name: key, score: 1 });
        }
        // Similarité
        else {
            const distance = levenshteinDistance(normalized, key);
            if (distance <= 2) {
                suggestions.push({ name: key, score: distance + 2 });
            }
        }
    }

    // Trier par score et retourner les meilleurs
    return suggestions
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map(s => s.name);
}

/**
 * Valide si une chaîne est un code hex valide
 */
export function isValidHexColor(hex: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(hex);
}
