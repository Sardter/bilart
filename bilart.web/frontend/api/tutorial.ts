import {get, postFormData, put, deleteItem, toQueryString} from "./crude";
import type { Tutorial, ApiReuslt } from "./api_types";

export const getTutorial = async (tutorialId: number): Promise<ApiReuslt<Tutorial>> => {
    return get<Tutorial>(`http://localhost:8000/tutorials/${tutorialId}`);
};

export type TutorialQueryParams = {
    media?: string;
    created_at?: string;
    artist_id?: number;
    title?: string;
    description?: string;
    search__title?: string;
    search__description?: string;
    tag_name?: string;
    favoriting_collector?: number;
};

export const getTutorials = async (params: TutorialQueryParams): Promise<ApiReuslt<Tutorial[]>> => {
    const queryString = toQueryString(params);
    return get<Tutorial[]>(`http://localhost:8000/tutorials?${queryString}`);
};

export type NewTutorialData = {
    title: string;
    description: string;
    media: Blob; // Handle file data appropriately
};

export const createNewTutorial = async (data: NewTutorialData): Promise<ApiReuslt<Tutorial>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('image', data.media);

    // Add any other fields to formData as needed
    return await postFormData<Tutorial>(`http://localhost:8000/tutorials`, formData);
};

export type UpdateTutorialData = {
    title?: string;
    description?: string;
    post_id?: number;
};


export const updateTutorial = async ( data: UpdateTutorialData): Promise<ApiReuslt<Tutorial>> => {
    return put<UpdateTutorialData, Tutorial>(`http://localhost:8000/tutorials`, data);
};


export const deleteTutorial = async (tutorial : Tutorial): Promise<ApiReuslt<null>> => {
    return await deleteItem(`http://localhost:8000/tutorials/${tutorial.post_id}`, null);
};


