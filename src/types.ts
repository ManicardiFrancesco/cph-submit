export interface CphSubmitResponse {
  empty: false;
  problemName: string;
  languageId: number;
  sourceCode: string;
  url: string;
}

export interface CphEmptyResponse {
  empty: true;
}
