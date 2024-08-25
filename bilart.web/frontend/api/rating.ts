import { get, post, put, deleteItem, toQueryString } from "./crude";
import { ApiReuslt, Rating } from "./api_types";

export type CreateRatingData = {
  score: number;
  comment: string;
  post_id: number;
};

type UpdateRatingData = {
  score?: number;
  comment?: string;
};

type AverageRating = {
  average_rating: number;
}

export const getRating = async (
  rating_id: number
): Promise<ApiReuslt<Rating>> => {
  return get<Rating>(`http://localhost:8000/ratings/${rating_id}`);
};

export const getArtRatingAverage = async (
  art_id: number
): Promise<ApiReuslt<AverageRating[]>> => {
  return get<AverageRating[]>(`http://localhost:8000/ratings/art/${art_id}`);
};

export const getArtistRatingAverage = async (
    artist_id: number
  ): Promise<ApiReuslt<number>> => {
    return get<number>(`http://localhost:8000/ratings/artist/${artist_id}`);
  };

type RatingQueryParams = {
  score?: number;
  gt__score?: number;
  lt__score?: number;
  search__comment?: string;
  post_id?: number;
  collector_id?: number;
};

export const getRatings = async (
  params: RatingQueryParams
): Promise<ApiReuslt<Rating[]>> => {
  const queryString = toQueryString(params);
  return get<Rating[]>(`http://localhost:8000/ratings?${queryString}`);
};

export const createNewRating = async (
  data: CreateRatingData
): Promise<ApiReuslt<Rating>> => {
  return post<CreateRatingData, Rating>(
    `http://localhost:8000/ratings`,
    data
  );
};

export const updateRating = async (
  rating_id: number,
  data: UpdateRatingData
): Promise<ApiReuslt<Rating>> => {
  return put<UpdateRatingData, Rating>(
    `http://localhost:8000/ratings/${rating_id}`,
    data
  );
};

export const deleteRating = async (
  rating_id: number
): Promise<ApiReuslt<null>> => {
  return await deleteItem(
    `http://localhost:8000/ratings/${rating_id}`,
    null
  );
};
