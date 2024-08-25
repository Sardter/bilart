import {get, post, put, deleteItem, toQueryString} from "./crude";
import type {Auction, ApiReuslt} from "./api_types";

export const getAuction = async (auctionId: number): Promise<ApiReuslt<Auction>> => {
    return get<Auction>(`http://localhost:8000/auctions/${auctionId}`);
};

type AuctionQueryParams = {
    start_time?: string;
    end_time?: string;
    gt__startTime?: string;
    gt__endTime?: string;
    lt__startTime?: string;
    lt__endTime?: string;
    active?: boolean;
    art_id?: number;
};

export const getAuctions = async (params: AuctionQueryParams): Promise<ApiReuslt<Auction[]>> => {
    const queryString = toQueryString(params);
    return get<Auction[]>(`http://localhost:8000/auctions?${queryString}`);
};


export type NewAuctionData = {
    start_time: string;
    end_time: string;
    active: boolean;
    art_id: number;
    artist_id: number;
};

export const createNewAuction = async (data: NewAuctionData): Promise<ApiReuslt<Auction>> => {
    return post<NewAuctionData, Auction>(`http://localhost:8000/auctions`, data);
};


export type UpdateAuctionData = {
    start_time?: string;
    end_time?: string;
    active?: boolean;
};

export const updateAuction = async (auctionId: number, data: UpdateAuctionData): Promise<ApiReuslt<Auction>> => {
    return put<UpdateAuctionData, Auction>(`http://localhost:8000/auctions/${auctionId}`, data);
};

export const deleteAuction = async (auctionId: number): Promise<ApiReuslt<null>> => {
    return await deleteItem(`http://localhost:8000/auctions/${auctionId}`, null);
};



