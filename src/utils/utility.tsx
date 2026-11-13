const convertDateToEpoch = async (date: string): Promise<number | null> => {
    if (date) {
        return new Date(date).getTime();
    }
    return null;
}

const converEpochToDate = async (date: number | string | null | undefined): Promise<string | null> => {
    if (date) {
        return new Date(date).toISOString().split('T')[0];
    }
    return '';
}

const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

const safeHref = (url: string | null | undefined): string => {
    if (!url) return '';
    try {
        const { protocol } = new URL(url);
        return SAFE_PROTOCOLS.includes(protocol) ? url : '';
    } catch {
        return '';
    }
};

export { convertDateToEpoch, converEpochToDate, safeHref };