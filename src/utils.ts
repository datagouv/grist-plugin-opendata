const accentMap: { [key: string]: string } = {
'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a',
'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'ē': 'e', 'ė': 'e', 'ę': 'e',
'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i', 'ī': 'i', 'į': 'i',
'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o', 'ø': 'o', 'ō': 'o',
'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ū': 'u',
'ç': 'c', 'ć': 'c', 'č': 'c',
'ñ': 'n', 'ń': 'n',
'ß': 'ss',
'ÿ': 'y',
};

const removeAccents = (str: string): string => {
return str.split('').map(char => accentMap[char] || char).join('');
};

const removeLeadingUnderscores = (str: string): string => {
return str.replace(/^_+/, '');
};

export function processString(str: string) {
    return removeLeadingUnderscores(removeAccents(str.replace(' ', '_').replace(':', '_')));
}
