import * as iso88592 from 'iso-8859-2';
import { Parser } from './parser';
import type { AllNorms, ChartDataSet, ExamMeta, FileData, NormValue, Results } from '../types/types';
import type { FileSystemDirectoryHandle } from 'wicg-file-system-access';
import type { Dictionary } from '../types/global';
import { getOkNorm, isOff } from './normsUtils';
import { ChartService } from './chartService';

export class DataLoader {
    private static instance: DataLoader;

    private dirHandler: FileSystemDirectoryHandle;

    private reportMetas: Dictionary<ExamMeta> = {};

    private filesOrderedByTime: string[] = [];

    private titleStructure: Dictionary<string[]> = {};

    private reportData: Dictionary<FileData> = {};

    private reportNorms: AllNorms = {};

    private chartsData: Dictionary<Dictionary<ChartDataSet>> = {};

    private constructor() {
    }

    public static getInstance(): DataLoader {
        if (!DataLoader.instance) {
            DataLoader.instance = new DataLoader();
        }
        return DataLoader.instance;
    }

    public async getReportMetas(isForce = false): Promise<Dictionary<ExamMeta>> {
        if (isForce || Object.keys(this.reportMetas).length === 0) {
            const handler = await this.getDirHandler();
            for await (const fileHandler of handler.values()) {
                if (fileHandler.kind !== 'file' || (!fileHandler.name.endsWith('htm') && !fileHandler.name.endsWith('html'))) {
                    continue;
                }
                const file = await fileHandler.getFile();
                const aBuffer = await file.arrayBuffer();
                const bufView = new Uint8Array(aBuffer);
                const fileContent = iso88592.decode(bufView);
                this.reportMetas[file.name] = Parser.findReportMeta(file.name, fileContent);
            }
            this.filesOrderedByTime = Object.values(this.reportMetas)
                .sort((a, b) => a.time - b.time)
                .map(r => r.fileName);
        }
        return this.reportMetas;
    }

    public getReportMetasCache(): Dictionary<ExamMeta> {
        return this.reportMetas;
    }

    public getFirstReportMetaCache(): ExamMeta {
        return Object.values(this.reportMetas)[0];
    }

    public async loadReportsFromDir(fileNames: string[]) {
        let loadNormsAndTitles = true;
        const handler = await this.getDirHandler();
        for await (const fileHandler of handler.values()) {
            if (!fileNames.includes(fileHandler.name)) {
                continue;
            }
            const file = await fileHandler.getFile();
            const aBuffer = await file.arrayBuffer();
            const bufView = new Uint8Array(aBuffer);
            const fileContent = iso88592.decode(bufView);
            const { data, norms } = Parser.parseHtml(fileContent, loadNormsAndTitles);
            this.reportData[file.name] = {
                fileName: file.name,
                data,
            };
            if (loadNormsAndTitles) {
                this.reportNorms = norms;
                // console.log('loadReportsFromDir reportNorms', JSON.stringify(this.reportNorms, null, '  '));
                // throw new Error();

                for (const title in this.reportNorms) {
                    for (const subTitle in this.reportNorms[title]) {
                        // console.log('---->>> loadReportsFromDir:', title, ':', subTitle, this.reportNorms[title]);
                        if (!getOkNorm(this.reportNorms[title][subTitle], true)) {
                            console.log('!!!---->>> Missing ok norm:', title, ':', subTitle, this.reportNorms[title][subTitle]);
                        }
                    }
                }

                // console.log('loadReportsFromDir titleStructure', JSON.stringify(this.titleStructure, null, '  '));
            }
            loadNormsAndTitles = false;
        }
        // console.log('loadReportsFromDir reportData', this.reportData);
    }

    public translateReportsToChartData() {
        // TODO: refactor to service
        if (Object.keys(this.reportData).length > 0) {
            for (const fileName of this.filesOrderedByTime) {
                const { time } = this.reportMetas[fileName];
                const report = this.reportData[fileName];
                for (const title of Object.keys(report.data)) {
                    if (!this.chartsData[title]) {
                        this.chartsData[title] = {};
                    }
                    for (const subTitle in report.data[title]) {
                        const dataRow = report.data[title][subTitle];
                        if (!this.chartsData[title][subTitle]) {
                            const norms = this.reportNorms[title][subTitle];
                            if (!norms || norms.length === 0) {
                                console.log('--->>> translateReportsToChartData reportNorms', title, this.reportNorms[title]);
                                console.log('--->>> translateReportsToChartData dataRow', JSON.stringify(dataRow));
                                console.log('--->>> translateReportsToChartData subTitle', JSON.stringify(subTitle));
                                console.log('--->>> translateReportsToChartData keys', JSON.stringify(Object.keys(this.reportNorms[title])));
                                throw new Error(`translateReportsToChartData EMPTY norms for ${title} : ${subTitle}`);
                            }
                            this.chartsData[title][subTitle] = {
                                norms,
                                times: [],
                                data: [],
                                isOff: [],
                            };
                        }
                        this.chartsData[title][subTitle].isOff.push(isOff(this.chartsData[title][subTitle].norms, dataRow.value));
                        this.chartsData[title][subTitle].times.push(time);
                        this.chartsData[title][subTitle].data.push(dataRow.value);
                    }
                }
            }

            this.titleStructure = Object
                .keys(this.chartsData).reduce((res, title) => {
                    res[title] = Object.keys(this.chartsData[title]);
                    return res;
                }, {} as Dictionary<string[]>);
        }
    }

    public getFirstChartData(): { subTitle: string; resultsChartData: ChartDataSet; title: string } {
        const title = Object.keys(this.chartsData)[0];
        const subTitle = Object.keys(this.chartsData[title])[0];
        const resultsChartData = this.chartsData[title][subTitle];
        return { title, subTitle, resultsChartData };
    }

    public getChartData(from: Date, to: Date, title: string, subTitle: string): ChartDataSet | undefined {
        return this.chartsData[title] && this.chartsData[title][subTitle];
    }

    public getTitleStructure(from: Date, to: Date, onlyOff: boolean = false): Dictionary<string[]> {
        if (!onlyOff) {
            return this.titleStructure;
        }

        const chartService = new ChartService();
        return Object.keys(this.titleStructure).reduce((res, title) => {
            const subTitles = this.titleStructure[title]
                .filter(subTitle => {
                        const filteredChartData = chartService.filterChartDataSetByTime(from, to, this.chartsData[title][subTitle]);
                        return filteredChartData.isOff
                            .reduce((result, isOff) => res && isOff, false);
                    }
                );
            if (subTitles.length > 0) {
                res[title] = subTitles;
            }
            return res;
        }, {} as Dictionary<string[]>);
    }

    private async getDirHandler() {
        if (!this.dirHandler) {
            this.dirHandler = await window.showDirectoryPicker();
        }
        return this.dirHandler;
    }
}
