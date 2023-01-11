import type { Dictionary } from './global.d.ts';

export interface ExamMeta {
    sex: string;
    name: string;
    age: string
    time: number;
    fileName: string;
}

export interface DataRow {
    subTitle: string;
    value: number;
    min: number;
    max: number;
}

export interface NormValue {
    level: string;
    min?: number;
    max?: number;
}

export type AllNorms = Dictionary<Dictionary<NormValue[]>>

export interface Norm {
    title: string;
    data: NormValue[];
}

export interface Results {
    normsVals: Norm[];
    values: DataRow[]
}

export type AllResults = Dictionary<Dictionary<DataRow>>;

export interface FileData extends ExamData {
    fileName: string;
    data: AllResults;
}

export interface ChartDataSet {
    times: number[];
    data: number[];
    norms: NormValue[];
    isOff: boolean[];
}
