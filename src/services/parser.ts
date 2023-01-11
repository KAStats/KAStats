import { clearWhitespace, replaceAll } from './utils';
import type { AllNorms, AllResults, DataRow, ExamMeta, Norm, NormValue, Results } from '../types/types';
import type { Dictionary } from '../types/global';
import { getOkNorm } from './normsUtils';

export const Parser =
    {
        skipBlocks: [
            'Układ kostny',
            'Skład ciała',
        ],

        noNormBlocks: [
            'Funkcje pęcherzyka żółciowego',
            'Funkcje trzustki',
            'Funkcje płuc',
            'Choroby reumatyczne kości',
            'Cukier we krwi',
            'ADHD',
        ],

        parseHtml: (html: string, loadNorms: boolean): { data: AllResults; norms: AllNorms } => {
            const mainParts = html.split('<FONT size=6>');
            mainParts.shift();
            let norms: AllNorms = {};
            const data: AllResults = {};

            for (const htmlPart of mainParts) {
                const title = Parser._getTitleFromPart(htmlPart);
                if (title && !Parser.skipBlocks.includes(title)) {
                    const isFetchingNorms = loadNorms && !Parser.noNormBlocks.includes(title);
                    let { normsVals, values } = Parser._parseDataBlock(title, htmlPart, isFetchingNorms);
                    data[title] = values.reduce((res, row) => {
                        res[row.subTitle] = row;
                        return res;
                    }, {} as Dictionary<DataRow>);

                    if (loadNorms) {
                        if (!isFetchingNorms) {
                            normsVals = Parser._getNormsFromValues(values);
                        }
                        const normsBySubTitle = normsVals.reduce((res, row) => {
                            res[row.title] = row.data;
                            return res;
                        }, {} as Dictionary<NormValue[]>);
                        norms[title] = Parser._addMissingOkNormsFromValues(data[title], normsBySubTitle);
                    }


                    // break;
                }
            }
            // console.log('parseHtml allResults', data);
            return { norms, data };
        },

        _getTitleFromPart: (htmlPart: string): null | string => {
            if (htmlPart.startsWith('(')) {
                const titleRaw = htmlPart.split('<')[0];
                const updatedT = titleRaw
                    .split(')')[0]
                    .replace('(', '');
                return clearWhitespace(updatedT);
            }
            return null;
        },

        findReportMeta: (fileName: string, htmlPart: string): ExamMeta => {
            const nameRes = htmlPart.match(/Imie: ([^\<]*)\</);
            const sexRes = htmlPart.match(/Plec: ([^\<]*)\</);
            const ageRes = htmlPart.match(/Wiek: ([^\<]*)\</);
            const timeRes = htmlPart.match(/Czas badania: ([^\<]*)\</);
            const timeStr = timeRes ?
                clearWhitespace(timeRes[1]) : '';
            const d = timeStr.match(/^([0-9]+)\/([0-9]+)\/([0-9]+) ([0-9]+):([0-9]+)$/);
            const time = new Date(`${d[3]}.${d[2]}.${d[1]} ${d[4]}:${d[5]}`).getTime();
            return {
                fileName,
                name: nameRes ? nameRes[1] : '',
                sex: sexRes ? sexRes[1] : '',
                age: ageRes ? ageRes[1] : '',
                time,
            }
        },

        _getNormsFromValues: (values: DataRow[]) => {
            return values.map((val: DataRow): Norm => {
                return {
                    title: val.subTitle,
                    data: [
                        {
                            level: '-',
                            min: val.min,
                            max: val.max,
                        },
                        {
                            level: '+++',
                            max: val.min,
                        },
                        {
                            level: '+++',
                            min: val.max,
                        }
                    ]
                };
            });
        },

        _addMissingOkNormsFromValues: (values: Dictionary<DataRow>, norms: Dictionary<NormValue[]>): Dictionary<NormValue[]> => {
            return Object.keys(norms).reduce((res, subTitle) => {
                const okNorm = getOkNorm(norms[subTitle], true);
                if (!okNorm) {
                    const newOkNorm = {
                        level: '-',
                        min: values[subTitle].min,
                        max: values[subTitle].max,
                    };
                    res[subTitle] = [...norms[subTitle], newOkNorm]
                }
                return res;
            }, norms);
        },

        _parseDataBlock: (mainTitle: string, htmlPart: string, isFetchingNorms: boolean): Results => {
            const dataPart = htmlPart.split('Aktualne badane')[1];
            if (dataPart) {
                return Parser._parseTableResults(mainTitle, dataPart, isFetchingNorms);
            } else {
                // TODO: support this
                return Parser._parseBodyComposition(htmlPart);
            }
        },

        _parseTableResults: (mainTitle: string, htmlPart: string, isFetchingNorms: boolean): Results => {
            const parts = clearWhitespace(htmlPart).split('<TR class=td align=left bgColor=#ebf5fb>');
            parts.shift();
            const rest = parts[parts.length - 1].replace(/^[\s\S]*?<\/TR>/m, '');
            const dataRowsHtml = parts.map(part => part.replace(/<\/TR>[\s\S]*/m, ''))

            const values = dataRowsHtml.map(dataRow => Parser._parseResultsDataRow(dataRow));
            const normsVals = isFetchingNorms ? Parser._parseResultsNormBlock(mainTitle, rest) : [];

            return {
                values,
                normsVals,
            }
        },

        _parseResultsDataRow: (dataRowHtml: string): DataRow => {
            const parts = dataRowHtml
                .split('</TD>').slice(0, 3)
                .map(r => r.replace('<TD class=td align=center>', ''));
            const borders = parts[1].split(' - ');
            return {
                subTitle: parts[0],
                value: parseFloat(parts[2].replace(',', '.')),
                min: parseFloat(borders[0].replace(',', '.')),
                max: parseFloat(borders[1].replace(',', '.')),
            };
        },

        _parseResultsNormBlock: (mainTitle: string, html: string): Norm[] => {
            const clearHtml = clearWhitespace(html);
            const blockParts = clearHtml
                .split('<TD><B>Poważne odstępstwo(+++)</B></TD></TR></TBODY></TABLE></TD></TR>');
            if (blockParts.length > 1) {
                const block = blockParts[1]
                    .split('<TD height=8 colSpan=3></TD></TR></TBODY></TABLE>')[0];
                const rows = block.split('<TD height=8 colSpan=3></TD></TR>');
                rows.shift();
                return rows.map(row => Parser._parseResultsNormRow(row));
            } else if (mainTitle === 'Mózg') {
                return Parser._parseResultsNormBlockMozg(mainTitle, clearHtml);
            } else {
                console.log('_parseResultsNormBlock mainTitle', JSON.stringify(mainTitle, null, '  '));
                console.log('_parseResultsNormBlock html', JSON.stringify(html, null, '  '));

                throw new Error('STOP');
            }
        },

        _parseResultsNormBlockMozg: (mainTitle: string, clearHtml: string): Norm[] => {
            const elements = clearHtml.split('<TD colSpan=3>').slice(2);
            elements[elements.length - 1] = elements[elements.length - 1].split('</TBODY></TABLE>')[0];
            return elements.map(row => {
                const parts = row.split('</TR>').slice(0, 4);
                const titleRow = parts.shift();
                const title = titleRow.substring(titleRow.indexOf(' ') + 1, titleRow.indexOf(':'));
                const data = parts.map(row => {
                        const elements = row.split('</TD>')
                            .slice(1, 3)
                            .map(v => v.replace('<TD>', ''));
                        const level = Parser._translateMozgLevel(elements[0].replace(/<TD[^>]*>/, ''));
                        const values = elements[1].split('--').map(e => e.replace(/<TD[^>]*>/, ''));
                        return Parser._translateNormValues(values, level);
                    }
                );
                return {
                    title,
                    data,
                };
            });
        },

        _translateMozgLevel: (levelRow: string) => {
            if (levelRow.startsWith('Lekk')) {
                return '+';
            }
            if (levelRow.startsWith('Średn')) {
                return '++';
            }
            if (levelRow.startsWith('Poważn')) {
                return '+++';
            }
            throw new Error(`Nieznany poziom normy: ${levelRow}`);
        },

        _parseResultsNormRow: (html: string): Norm => {
            const parts = html
                .split('</TR>').slice(0, 2)
                .map(row =>
                    replaceAll(row.replace('<TR align=center><TD>', ''), '</TD>', '')
                        .split('<TD')
                )
                .flat();
            const title = parts[0].replace(':', '');
            const normParts = [parts[1], parts[2], parts[3], parts[4], parts[5]];
            const data = normParts
                .filter(row => !!row && row !== '&nbsp;')
                .map(p => p.replace(/^[^>]*>/, ''))
                .map(row => Parser._parseNormRow(row));
            return {
                title,
                data,
            }
        },

        _parseNormRow: (row: string): NormValue => {
            const [valuesRow, levelParam] = row.replace(')', '').split('(');
            const values = valuesRow.split('-');
            const level = Parser._translateNormLevel(levelParam);
            return Parser._translateNormValues(values, level);
        },

        _translateNormValues: (values: string[], level: string): NormValue => {
            if (values.length === 2) {
                const vals = values.map(v => parseFloat(v.replace(',', '.')));
                const [min, max] = vals[0] < vals[1] ? vals : [vals[1], vals[0]];
                if (!min || !max) {
                    // Poziom dotlenienia mózgu
                    console.log('--->>> _translateNormValues', values, min, max);
                    throw new Error();
                }
                return {
                    level,
                    min,
                    max,
                };
            } else {
                const [sign, val] = values[0].replace(',', '.').split(';');
                if (sign === '&lt') {
                    return {
                        level,
                        max: parseFloat(val),
                    };
                } else {
                    return {
                        level,
                        min: parseFloat(val),
                    };
                }
            }
        },

        _translateNormLevel: (level: string) => {
            switch (level) {
                case 'Norma':
                    return '-';
                case 'Zasadowe':
                    return '+++';
                case 'Kwaśne':
                    return '+++';
                default:
                    return level;
            }
        },

        _parseBodyComposition: (htmlPart: string) => {
            console.error('Not implemented _parseBodyComposition');
            return {
                values: [],
                normsVals: [],
            }
        }
    }
