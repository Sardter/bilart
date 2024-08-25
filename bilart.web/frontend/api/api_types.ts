export type User = {
  user_id: number;
  username: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_image: string | null;
  created_at: Date;
  phone: string | null;
  rank: number;
  artist_id: number;
  bio: string | null;
  link: string | null;
  admin_id: number;
  privileges: "N" | "M" | "A";
};

export type Collection = {
  collection_id: number;
  name: string;
  collector_id: number;
  created_at: Date;
};

export type Art = {
  art_id: number;
  content: string | null;
  price: number;
  collector_id: number | null;
  post_id: number;
  artist_id: number;
  created_at: Date;
  title: string | null;
  description: string | null;
};

export type Tutorial = {
  tutorial_id: number;
  media: string | null;
  post_id: number;
  artist_id: number;
  created_at: Date;
  title: string | null;
  description: string | null;
};

export type Rating = {
  rating_id: number;
  score: number;
  comment: string | null;
  post_id: number;
  collector_id: number;
  user_id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_image: string | null;
  created_at: Date;
};

export type Tag = {
  tag_name: string;
};

export type Auction = {
  auction_id: number;
  start_time: Date;
  end_time: Date;
  active: boolean;
  art_id: number;
};

export type Bid = {
  bid_id: number;
  price: number;
  auction_id: number;
  collector_id: number;
  created_at: Date;
  payment_done: boolean;
  user_id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_image: string | null;
};

export type NotificationModel = {
  notification_id: number;
  content: string;
  created_at: string;
  read: boolean;
  user_id: number;
};

export type ReportModel<T> = {
  report_id: number;
  content: string;
  created_at: Date;
  entity_name: string;
  entity_id: number;
  user_id: number;
  username: string;
  entity: T
};

export type ApiReuslt<T> = {
  data: T | null;
  message: string | null;
  count: number | null;
  success: boolean | null;
};
