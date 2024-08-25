import {get, post, put, deleteItem, toQueryString, setCredentials, cleanCredentials, publicPost} from "./crude";
import type {User, ApiReuslt} from "./api_types";

export const getMe = async (): Promise<ApiReuslt<User>> => {
    return get<User>(`http://localhost:8000/users/me`);
};


export const loginUser = async (username: string, password: string): Promise<ApiReuslt<User>> => {
    setCredentials(username, password);
    const result = await getMe();
    if (result.data == null) {
        cleanCredentials();
    }
    return result;
}

export const deleteUser = async (): Promise<ApiReuslt<null>> => {
   return await deleteItem(`http://localhost:8000/users/me`, null);
};

type UpdateUserData = {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string;
    bio?: string;
    link?: string;
    privileges?: string;
};


export const updateUser = async (data: UpdateUserData): Promise<ApiReuslt<User>> => {
    return put<UpdateUserData, User>(`http://localhost:8000/users/me`, data);
};


export const getUserById = async (user_id: number): Promise<ApiReuslt<User>> => {
    return get<User>(`http://localhost:8000/users/${user_id}`);
};


export const getUserByUsername = async (username: string): Promise<ApiReuslt<User>> => {
    return get<User>(`http://localhost:8000/users/${encodeURIComponent(username)}`);
};


type UserQueryParams = {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    bio?: string;
    link?: string;
    privledge?: string;
    rank?: number;
    search__username?: string;
    search__first_name?: string;
    search__last_name?: string;
    search__email?: string;
    search__bio?: string;
    created_at?: string;
    all?: boolean;
};

export const getUsers = async (params: UserQueryParams): Promise<ApiReuslt<User[]>> => {
    const queryString = toQueryString(params);
    return get<User[]>(`http://localhost:8000/users?${queryString}`);
};


export const createNewUser = async (data: User): Promise<ApiReuslt<User>> => {
    return publicPost<User, User>(`http://localhost:8000/users/register`, data);
};

type Privileges = {
    privileges: string;
}


export const changePrivileges = async (user_id: number, data: Privileges): Promise<ApiReuslt<Privileges>> => {
    return post<Privileges, Privileges>(`http://localhost:8000/users/${user_id}/change_privileges`, data);
}