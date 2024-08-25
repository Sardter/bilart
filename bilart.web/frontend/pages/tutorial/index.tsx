import { useRouter } from "next/router";
import * as React from "react";

import {
  Stack,
  Grid
} from "@mui/material";
import { PostActionsBar, DomainDivider } from "@/components/shared";

import { AuthError } from "@/api/crude";
import { AxiosError } from "axios";
import type { Tutorial } from "@/api/api_types";
import { getMe } from "@/api/user";
import { useSnackbar } from "@/store/snackbar";
import { TutorialQueryParams, getTutorials } from "@/api/tutorial";
import { AddTutorialCard } from "@/components/tutorial/AddTutorialCard";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import PostsLayout from "@/layout/posts";

function TutorialsPage() {

  const router = useRouter();
  const snackbar = useSnackbar();

  const [tutorials, setTutorials] = React.useState<Tutorial[]>([]);


  React.useEffect(() => {
    const fetchCurrUseTutorials = async () => {
      try {
        const me = await getMe();
        console.info("Current User")
        console.info(me.data);
        const query : TutorialQueryParams = {
          artist_id: me.data?.artist_id
        }
        getTutorials(query)
        .then(res => setTutorials(res.data!));
      }  catch (err) {
        if (err instanceof AuthError) {
          snackbar("error", "Session does not exist");
          router.replace("/login")
          return;
        }
        if (err instanceof AxiosError && err.response?.status === 401) {
          snackbar("error", "Incorrect username or password");
          router.replace("/login");
        } else {
          snackbar("error", "an error occured. See console for more details");
          console.error(err);
        }         
      } 
    }

    fetchCurrUseTutorials();
  }, []);

  return (
    <Stack direction="column" gap={2} sx={{height: "100%"}}>
      <PostActionsBar 
        title={"My Tutorials"}
        actions={[]}
      />
      <DomainDivider color="#fff" />
      <Grid container spacing={1}>
        {
          tutorials.map((tutorial, index) => {
            return (
              <Grid item xs={3} key={tutorial.tutorial_id}>
                <TutorialCard 
                  tutorialId={tutorial.tutorial_id}
                  title={tutorial.title ?? ""}
                  content={tutorial.media ?? ""}
                  description={tutorial.description ?? ""}
                />
              </Grid>
            )
          })
        }
        <Grid item xs={3} style={{display : "flex", alignItems : "center", justifyContent: "center"}}>
          <AddTutorialCard />
        </Grid>
      </Grid>
    </Stack>
  )
}

TutorialsPage.getLayout = (page: React.ReactNode) => {
  return <PostsLayout>{page}</PostsLayout>
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true,
    },
  };
}


export default TutorialsPage;