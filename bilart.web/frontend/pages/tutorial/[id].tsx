import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import type {Tag, Art, Auction, Rating, Tutorial, User} from "@/api/api_types";
import {
  Grid,
  Stack,
  Box,
  useTheme,
  Typography,
  ButtonGroup,
  Button,
  Chip,
  Paper,
  TextField,
  Avatar
} from "@mui/material";
import { BACKEND_URL } from "@/routes";
import {
  DomainDivider,
  DomainImage,
} from "@/components/shared";

import { useSnackbar } from "@/store/snackbar";
import { CreateRatingData, createNewRating, getRatings } from "@/api/rating";
import { getTags } from "@/api/tags";
import { getMe } from "@/api/user";
import { AxiosError } from "axios";
import { AuthError } from "@/api/crude";
import { deleteTutorial, getTutorial } from "@/api/tutorial";


export default function ArtPage() {
  const router = useRouter();
  const { query } = router;
  const tutorialId = query.id;

  const snackbar = useSnackbar();
  const [tutorialInfo, setTutorialInfo] = React.useState<Tutorial | null>(null);
  const theme = useTheme();
  const [comments, setComments] = React.useState<Rating[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);

  const fetchTutorialInfo = async () : Promise<Tutorial | null> => {
    try {
      const data = await getTutorial(Number(tutorialId));
      if ("data" in data) {
        setTutorialInfo(data.data);
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

  const fetchTags = async (tutorial: Tutorial) => {
    try {
      const data = await getTags({ post_id: tutorial.post_id });
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


  const fetchComments = async (tutorial : Tutorial) => {
    try {
      const data = await getRatings({ post_id: tutorial.post_id });
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
    const tutorial = await fetchTutorialInfo();
    if (tutorial !== null) {
      fetchComments(tutorial);
      fetchTags(tutorial);
    }
  };

  React.useEffect(() => {

    if (tutorialId) 
      fetch();
  }, [tutorialId]);

  const formatDate = (dateString: string): string => {
    const timestamp = Date.parse(dateString);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const handleTutorialDelete= async() => {
    try {
      await deleteTutorial(tutorialInfo!);
      snackbar("success", "art deleted");
      router.back();
    } catch (err) {
      console.log(err);
    }
  }

  const [discussionComment, setDiscussionComment] = React.useState<string>("");
  const handleDiscussionSubmit = async() => {
    try {
      const data : CreateRatingData = {
        score: 1,
        comment: discussionComment,
        post_id: tutorialInfo!.post_id
      };
      const res = await createNewRating(data);
      fetchComments(tutorialInfo!);
    } catch (err) {
      console.log(err);
    }
  }


  return (
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
              src={`http://localhost:8000/${tutorialInfo?.media}`}
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
              <Typography variant="h4" color={theme.palette.primary.main}>
                {tutorialInfo?.title}
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
            <DomainDivider color={theme.palette.primary.main} />
            <Box sx={{padding: "1rem", borderRadius: 5, backgroundColor: theme.palette.primary.main, flexGrow: 1, overflowY: "scroll"}}>
              <Typography variant="h5" color="#fff">Description</Typography>
              <Typography variant="h6" color="#fff">{tutorialInfo?.description}</Typography>
            </Box>
            <ButtonGroup
              variant="contained"
              sx={{ alignSelf: "flex-end" }}
            >
              <Button sx={{ color: "#fff" }} onClick={handleTutorialDelete}>Delete</Button>
              <Link href={`/tutorial/create?edit=true&tutorial_id=${tutorialInfo?.tutorial_id}`}><Button sx={{ color: "#fff" }}>Edit</Button></Link>
            </ButtonGroup>
          </Stack>
        </Grid>
      </Grid>
      <Typography variant="h4" color={theme.palette.primary.main}>
        Discussions
      </Typography>
      <Stack direction="row" gap={2}>
          <TextField 
            label="Your Discussion"
            placeholder="Enter Your Discussion"
            value={discussionComment}
            onChange={(e) => setDiscussionComment(e.target.value)}
            sx={{flexGrow: 1}}
          />
          <Button variant="contained" onClick={handleDiscussionSubmit}>
            Submit Your Discussion
          </Button>
        </Stack>
      <Ratings ratings={comments} />
    </Stack>
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
};

const Ratings: React.FC<RatingsProps> = ({ ratings }) => {

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
            <TextField
              sx={{flexGrow : 1}}
              size="small" 
              disabled
              value={rating.comment}
            />
          </Stack>
        </Paper>
      ))
    }
    <div style={{width: "100%", height: 100}} />
    </Stack>
  );
};
