import {get, post, put, deleteItem, toQueryString} from "./crude";
import type {Collection, ApiReuslt} from "./api_types";

export const getCollection = async (collection_id: number): Promise<ApiReuslt<Collection>> => {
    return get<Collection>(`http://localhost:8000/collections/${collection_id}`);
};

type CollectionQueryParams = {
    name?: string;
    search__name?: string;
    collector_id?: number;
};

export const getCollections = async (params: CollectionQueryParams): Promise<ApiReuslt<Collection[]>> => {
    const queryString = toQueryString(params);
    return get<Collection[]>(`http://localhost:8000/collections?${queryString}`);
};

type CreateCollectionData = {
    name: string;
};

export const createNewCollection = async (data: CreateCollectionData): Promise<ApiReuslt<Collection>> => {
    return post<CreateCollectionData, Collection>(`http://localhost:8000/collections`, data);
};


export const updateCollection = async (collection_id: number, data: CreateCollectionData): Promise<ApiReuslt<Collection>> => {
    return put<CreateCollectionData, Collection>(`http://localhost:8000/collections/${collection_id}`, data);
};


export const deleteCollection = async (collection_id: number): Promise<ApiReuslt<null>> => {
    return await deleteItem<null>(`http://localhost:8000/collections/${collection_id}`, null);
};

type ArtCollection = {
    art_id: number;
    collection_id: number;
}

export const addToCollection = async (data: ArtCollection): Promise<ApiReuslt<ArtCollection>> => {
    return post<ArtCollection, ArtCollection>(`http://localhost:8000/collect`, data);
}

export const deleteFromCollection = async (data: ArtCollection): Promise<ApiReuslt<ArtCollection>> => {
    return deleteItem<ArtCollection>(`http://localhost:8000/collect`, data);
}