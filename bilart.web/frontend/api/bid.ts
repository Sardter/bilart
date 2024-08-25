import { get, post, put, deleteItem, toQueryString } from "./crude";
import type {Bid, ApiReuslt} from "./api_types";

export const getBid = async (bid_id: number): Promise<ApiReuslt<Bid>> => {
  return get<Bid>(`http://localhost:8000/bids/${bid_id}`);
};

type BidQueryParams = {
  bid_id?: number;
  price?: string;
  gt__price?: string;
  lt__price?: string;
  auction_id?: number;
  collector_id?: number;
  payment_done?: boolean;
  created_at?: string;
  price_order?: "asc" | "desc" | null;
};

export const getBids = async (
  params: BidQueryParams
): Promise<ApiReuslt<Bid[]>> => {
  const queryString = toQueryString(params);
  return get<Bid[]>(`http://localhost:8000/bids?${queryString}`);
};

type CreateBidData = {
  price: string;
  auction_id: number;
};

export const createNewBid = async (
  data: CreateBidData
): Promise<ApiReuslt<Bid>> => {
  return post<CreateBidData, Bid>(`http://localhost:8000/bids`, data);
};

export const deleteBid = async (bid_id: number): Promise<ApiReuslt<null>> => {
  return await deleteItem(`http://localhost:8000/bids/${bid_id}`, null);
};

export const acceptPayment = async (
  bid_id: number
): Promise<ApiReuslt<null>> => {
  return await post<{ bid_id: number }, null>(
    `http://localhost:8000/bids/accept_payment/${bid_id}`,
    { bid_id }
  );
};
