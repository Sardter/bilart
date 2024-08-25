import { ApiReuslt, NotificationModel } from "./api_types";
import {get, post} from "./crude";


export const getNotifications = async (): Promise<ApiReuslt<NotificationModel[]>> => {
    return get<NotificationModel[]>(`http://localhost:8000/notifications`);
};


export const readNotifications = async (): Promise<ApiReuslt<NotificationModel[]>> => {
    return await post<null, NotificationModel[]>(`http://localhost:8000/notifications`, null);
};
