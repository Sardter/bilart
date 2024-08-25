import { get, post, put, deleteItem, toQueryString } from "./crude";
import type {Tag, ApiReuslt} from "./api_types";

type CreateTagData = {
  tag_name: string;
};

export const getTag = async (tag_name: string): Promise<ApiReuslt<Tag>> => {
  return get<Tag>(
    `http://localhost:8000/tags/${encodeURIComponent(tag_name)}`
  );
};

export type TagQueryParams = {
  search__tag_name?: string;
  post_id?: number;
};

export const getTags = async (
  params: TagQueryParams
): Promise<ApiReuslt<Tag[]>> => {
  const queryString = toQueryString(params);
  return get<Tag[]>(`http://localhost:8000/tags?${queryString}`);
};

export const createNewTag = async (
  data: CreateTagData
): Promise<ApiReuslt<Tag>> => {
  return await post<CreateTagData, Tag>(`http://localhost:8000/tags`, data);
};

export const deleteTag = async (tag_name: string): Promise<ApiReuslt<null>> => {
  return await deleteItem(
    `http://localhost:8000/tags/${encodeURIComponent(tag_name)}`,
    null
  );
};

export type TagPostModel = {
  tag_name: string;
  post_id: number;
};

export const addTagToPost = async (
  data: TagPostModel
): Promise<ApiReuslt<null>> => {
  return await post<TagPostModel, null>(
    `http://localhost:8000/categorise`,
    data
  );
};

export const deleteTagFromPost = async (data: TagPostModel): Promise<ApiReuslt<TagPostModel>> => {
  return await deleteItem<TagPostModel>(`http://localhost:8000/categorise`, data);
};
