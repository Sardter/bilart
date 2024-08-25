import { ApiReuslt, ReportModel } from "./api_types";
import { get, post, toQueryString } from "./crude";

export type CreateReportData = {
  content: string;
  entity_name: "Art";
  entity_id: number;
};

export const getReport = async <T>(
  report_id: number
): Promise<ApiReuslt<ReportModel<T>>> => {
  return get<ReportModel<T>>(`http://localhost:8000/reports/${report_id}`);
};

type ReportQueryParams = {
  content?: string;
  search__content?: string;
  created_at?: string;
  entity_name?: string;
  entity_id?: number;
  user_id?: number;
  all?: boolean;
};

export const getReports = async (
  params: ReportQueryParams
): Promise<ApiReuslt<ReportModel<any>[]>> => {
  const queryString = toQueryString(params);
  return get<ReportModel<any>[]>(
    `http://localhost:8000/reports?${queryString}`
  );
};

export const createReport = async (
  data: CreateReportData
): Promise<ApiReuslt<ReportModel<null>>> => {
  return await post<CreateReportData, ReportModel<null>>(
    `http://localhost:8000/reports`,
    data
  );
};

export const acceptReport = async (
  report_id: number
): Promise<ApiReuslt<null>> => {
  return await post<null, null>(
    `http://localhost:8000/reports/${report_id}`,
    null
  );
};

export const rejectReport = async (
  report_id: number
): Promise<ApiReuslt<null>> => {
  return await post<null, null>(
    `http://localhost:8000/reports/${report_id}`,
    null
  );
};
