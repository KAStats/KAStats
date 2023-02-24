export const replaceAll = (str: string, find: string, replace: string): string => {
    return str.replace(new RegExp(find, 'g'), replace);
}

export const clearWhitespace = (str: string): string =>
    replaceAll(replaceAll(str, '\r\n', ''), '  ', '')

export const isDarkMode = (): boolean =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
