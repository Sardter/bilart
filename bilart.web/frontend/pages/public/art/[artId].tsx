import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import type {Tag, Art, Auction, Rating, User} from "@/api/api_types";
import {
  Grid,
  Stack,
  Box,
  Chip,
  useTheme,
  Typography,
  ButtonGroup,
  Button,
  IconButton,
  TextField,
  Paper,
  Avatar
} from "@mui/material";
import {
  DomainDivider,
  DomainImage,
} from "@/components/shared";
import LinkIcon from '@mui/icons-material/Link';
import { useSnackbar } from "@/store/snackbar";
import { ArtQueryParams, getArt, getArts } from "@/api/art";
import { getAuctions } from "@/api/auction";
import { getTags } from "@/api/tags";
import { CreateRatingData, createNewRating, getArtRatingAverage, getRatings } from "@/api/rating";
import {favorite, getFavoritePosts, unFavorite} from "@/api/favorite"; 

import { AxiosError } from "axios";
import { AuthError } from "@/api/crude";
import AuctionModal from "@/components/auction/AuctionModal";
import { getMe, getUserById } from "@/api/user";
import { BACKEND_URL } from "@/routes";
import ReportModal from "@/components/shared/ReportModal";


export default function ArtPage() {
  const router = useRouter();
  const { query } = router;
  const artId = query.artId;

  const snackbar = useSnackbar();
  const [artInfo, setArtInfo] = React.useState<Art | null>(null);
  const theme = useTheme();
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [auctions, setAuctions] = React.useState<Auction[]>([]);
  const [comments, setComments] = React.useState<Rating[]>([]);


  const[avgArtRating, setavgArtRating] = React.useState<number>(0);
  const fetchAvgRating = async(art : Art) => {
    try {
        const res = await getArtRatingAverage(art.art_id);
        res.data && res.data.at(0) && setavgArtRating(+(res.data.at(0)!.average_rating.toFixed(2)));
    } catch (err) {
      console.log("error");
      console.error(err);
    }
  }


  const [isFavorited, setIsFavorited] = React.useState<boolean>(false);
  const fetchArtInfo = async () : Promise<Art | null> => {
    try {
      const data = await getArt(Number(artId));
      console.log(data);
      setArtInfo(data.data);
      if ("data" in data) {
        setArtInfo(data.data);
        return data.data;
      } else {
        snackbar("error", "failed to fetch art");
        return null;
      }
    } catch (err) {
      if (err instanceof AuthError) {
        snackbar("error", "Session does not exist");
        router.replace("/login")
      }
      if (err instanceof AxiosError && err.response?.status === 401) {
        snackbar("error", "Incorrect username or password");
        router.replace("/login");
      } else {
        snackbar("error", "an error occured. See console for more details");
        console.error(err);
      }
    }
    return null;
  };

  const fetchAuctions = async (art: Art) => {
    try {
      const data = await getAuctions({ art_id: Number(art.art_id) });
      console.log(data);
      if (data.data != null) {
        setAuctions(data.data);
      } else {
        snackbar("error", "failed to fetched");
      }
    } catch (err) {
      console.log(err);
      snackbar("error", "failed to fetched");
    }
  };
  const fetchTags = async (art: Art) => {
    try {
      const data = await getTags({ post_id: art.post_id });
      console.info(data);
      console.log(data);
      if (data.data != null) {
        setTags(data.data);
      } else {
        snackbar("error", "failed to fetched");
      }
    } catch (err) {
      console.log(err);
      snackbar("error", "failed to fetched");
    }
  };

  const fetchComments = async (art: Art) => {
    try {
      const data = await getRatings({ post_id: art.post_id });
      if ( data.data != null) {
        setComments(data.data);
      } else {
        snackbar("error", "failed to fetched");
      }
    } catch (err) {
      console.log(err);
      snackbar("error", "failed to fetched");
    }
  };

  const fetch = async () => {
    const art = await fetchArtInfo();
    if (art != null) {
      fetchAuctions(art);
      fetchTags(art);
      fetchComments(art);
      fetchAvgRating(art);
    }
  };

  React.useEffect(() => {
    if (artId) 
      fetch();
  }, [artId]);

  const fetchFavorites = async() => {
    try {
        const favoritedArts = await getFavoritePosts();
        if (favoritedArts.data?.some(post => post.post_id === artInfo?.post_id)) {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }
    } catch (err) {
      console.error(err);
    }
  }
  React.useEffect(() => {
    if (artInfo)
      fetchFavorites();
  }, [artInfo]);

  const formatDate = (dateString: string): string => {
    const timestamp = Date.parse(dateString);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const handleArtFavorite = async () => {
    try {
      if (!isFavorited) {
        const favRes = await favorite({post_id : artInfo!.post_id});
        snackbar("success", "added to favorites");
        setIsFavorited(true);
      } else {
        const unfavRes = await unFavorite({post_id: artInfo!.post_id});
        snackbar("success", "removed from favorites");
        setIsFavorited(false);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        snackbar("error", "Session does not exist");
        router.replace("/login")
      }
      if (err instanceof AxiosError && err.response?.status === 401) {
        snackbar("error", "Incorrect username or password");
        router.replace("/login");
      } else if (err instanceof AxiosError && err.response?.status === 500) {
        snackbar("error", "end date should be greater than startdate");
      } else {
        snackbar("error", "an error occured. See console for more details");
        console.error(err);
      }
    }
  }

  const [ratingComment, setRatingComment] = React.useState<string>("");
  const [ratingScore, setRatingScore] =React.useState<string>("");

  const handleRatingSubmit = async () => {
    try {
      const data : CreateRatingData = {
        score: Number(ratingScore),
        comment: ratingComment,
        post_id: artInfo!.post_id
      }    
      const res = await createNewRating(data);
      console.log('rating response');
      console.log(res);
      await Promise.allSettled([
        fetchComments(artInfo!),
        fetchAvgRating(artInfo!)
      ]);
      snackbar("success", "your rating was submitted");
    } catch (err) {
      snackbar("error", "an error occured with rating");
      console.error(err);
    }
  }

  const [reportModal, setReportModal] = React.useState<boolean>(false);

  return (
    <>
     {
      artInfo && 
        <ReportModal 
          entity_id={artInfo!.art_id}
          entity_name="Art"
          open={reportModal}
          onClose={() => setReportModal(false)}
        />
     }
      <Stack direction="column" gap={2} sx={{ height: "100%" }}>
        <Grid container gap={0.5} justifyContent="space-between">
          <Grid item xs={4}>
            <Box
              sx={{
                width: "100%",
                aspectRatio: "1/1",
                backgroundColor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center"
              }}
            >
              <DomainImage 
                src={`http://localhost:8000/${artInfo?.content}`}
                alt={"art image"}
              />
            </Box>
          </Grid>
          <Grid item xs={7.5}>
            <Stack
              direction="column"
              gap={1}
              sx={{ position: "relative", height: "100%" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
                  {artInfo?.title}
                </Typography>
                <div>
                  {React.Children.toArray(
                    tags.map((tagname) => (
                      <Chip
                        label={tagname.tag_name}
                        sx={{ marginLeft: "10px" }}
                        color="primary"
                      />
                    ))
                  )}
                </div>
              </div>
              <Typography color={theme.palette.primary.main}>
                Average Rating: {avgArtRating}
              </Typography>
              <DomainDivider color={theme.palette.primary.main} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
                  TL {artInfo?.price}
                </Typography>
                <Typography variant="h6" sx={{color: theme.palette.primary.light}}>
                  starting price
                </Typography>
              </div>
              <Box sx={{padding: "1rem", borderRadius: 5, backgroundColor: theme.palette.primary.main, flexGrow: 1}}>
                <Typography variant="h5" color="#fff">Description</Typography>
                <Typography variant="h6" color="#fff">{artInfo?.description}</Typography>
              </Box>
              <ButtonGroup
                variant="contained"
                sx={{ alignSelf: "flex-end" }}
              >
                <Button sx={{ color: "#fff" }} onClick={handleArtFavorite}>
                  {isFavorited? "Remove From Favorites" : "Add To Favorites"}
                </Button>
                <Button sx={{color: "#fff"}} onClick={() => setReportModal(true)}>
                  Report
                </Button>
              </ButtonGroup>
            </Stack>
          </Grid>
        </Grid>

        <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
          Auctions
        </Typography>

        <Grid container gap={1} width="100%">
          {
            auctions.length !== 0 ?
              React.Children.toArray(
                auctions.map((data, index) => (
                  <Grid item xs={2}>
                    <Paper sx={{ padding: "0.25rem 1rem", backgroundColor: data.active ? theme.palette.primary.main : theme.palette.primary.light }}>
                      <Typography color="#fff">
                        Auction {index + 1}
                        <Link href={`/public/auction/${data.auction_id}`}>
                          <IconButton>
                            <LinkIcon fontSize="small" style={{fill: theme.palette.secondary.main}} />
                          </IconButton>
                        </Link>
                      </Typography>
                      <DomainDivider color="black" />{" "}
                      {data.start_time != null ? (
                        <Typography variant="body2" color="#ffffff99">
                          Starting: {formatDate(data.start_time as any)}
                        </Typography>
                      ) : null}
                      {data.start_time != null ? (
                        <Typography variant="body2" color="#ffffff99">
                          Ending: {formatDate(data.end_time as any)}
                        </Typography>
                      ) : null}
                      {data.active != null ? (
                        <Typography variant="body2" color="#ffffff99">
                          Active: {data.active ? "True" : "False"}
                        </Typography>
                      ) : null}
                    </Paper>
                  </Grid>
              )))
            :
            <Grid item xs={12}>
              <Paper sx={{backgroundColor: "grey", display : "flex", alignItems: "center", justifyContent: "center", padding: "1rem"}}>
                <Typography sx={{color: "white"}}>
                  No Auctions Available
                </Typography>
              </Paper>
            </Grid>  
          }
        </Grid>

        <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
          Comments
        </Typography>
        <Stack direction="row" gap={2}>
          <TextField 
            label="Your Comment"
            placeholder="Enter Your Comment"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            sx={{flexGrow: 1}}
          />
          <TextField 
            label="Your Score"
            placeholder="Enter Your Score"
            value={ratingScore}
            type='number'
            onChange={(e) => setRatingScore(e.target.value)}
            sx={{flexGrow: 1}}
          />
          <Button variant="contained" onClick={handleRatingSubmit}>
            Submit Your Rating
          </Button>
        </Stack>
        <Ratings ratings={comments} art={artInfo} />
      </Stack>

    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true,
    },
  };
}

type RatingsProps = {
  ratings: Rating[];
  art: Art | null;
};

const Ratings: React.FC<RatingsProps> = ({ ratings, art }) => {
  
  const [artist, setArtist] = React.useState<User | null>(null);
  React.useEffect(() => {
    const fetchArtist = async () => {
      try {
        const artist = await getUserById(art!.artist_id);
        if (artist.data)
          setArtist(artist.data);
      } catch (err) {
        console.error(err);
      }
    }
    if (art) 
      fetchArtist();
  }, [art, ratings]);
  
  return (
    <Stack direction="column" gap={2}>
      {
        ratings.map((rating) => (
        <Paper key={rating.user_id}>
          <Stack direction="row" sx={{ padding: "0.5rem"}} justifyContent="space-between" alignItems="center" gap={2}>
            <div style={{display: "flex", justifyContent: "left", alignItems: "center", gap: 4}}>
              <Avatar 
                  src={`${BACKEND_URL}/${rating.profile_image}`}
              />
              <Typography>
                {rating.username}
              </Typography>
            </div>
            {
              rating.user_id === artist?.user_id &&
              <Chip color="secondary" label={<Typography sx={{color: "white"}}>Artist</Typography>} />
            }
            <TextField
              sx={{flexGrow : 1}}
              size="small" 
              disabled
              value={rating.comment}
            />
            {
              rating.user_id !== artist?.user_id &&
              <div style={{ display: "flex", alignItems: "center"}}>
                {"★".repeat(rating.score)}
                {"☆".repeat(5 - rating.score)}
              </div>
            }
          </Stack>
        </Paper>
      ))
    }
    <div style={{width: "100%", height: 100}} />
    </Stack>
  );
};
