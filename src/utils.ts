export const queryUrl = async(url: string, method: string = 'GET', headers = {}, body: any = null) => {
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export const utilsGetMetadata = async (gristUrl: string, docId: any, table: string, token: string) => {
    const url = `${gristUrl}/api/docs/${docId}/tables/${table}/records?auth=${token}`;
    const data = await queryUrl(url);
    const taxonomies: any = {};
    data.records.forEach((item: { fields: any; id_technique: string; valeur: any; }) => {
        taxonomies[item.fields.id_technique] = item.fields.valeur;
    });
    return taxonomies;
}


const removeLeadingUnderscores = (str: string): string => {
    return str.replace(/^_+/, '');
};

export function processString(str: string) {
    // 1) Normalize and strip accents using Unicode combining marks
    const withoutAccents = str.normalize('NFD').replace(/\p{M}+/gu, '');
    // 2) Replace any sequence of non-alphanumeric characters with a single underscore
    const underscored = withoutAccents.replace(/[^A-Za-z0-9]+/g, '_');
    // 3) Trim leading/trailing underscores
    const trimmed = underscored.replace(/^_+|_+$/g, '');
    // 4) Ensure we don't start with underscores after trimming (legacy helper)
    return removeLeadingUnderscores(trimmed);
}
