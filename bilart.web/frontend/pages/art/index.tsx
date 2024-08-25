import * as React from "react";

import type {Art} from "@/api/api_types";
import { getArts } from "@/api/art";
import { getMe } from "@/api/user";
import { ArtCard, CreateArtButton } from "@/components/artist";
import { useSnackbar } from "@/store/snackbar";
import { Grid, Stack } from "@mui/material";
import { AddArtCard } from "@/components/artist/AddArtCard";

import { DomainDivider, PostActionsBar } from "@/components/shared";
import PostsLayout from "@/layout/posts";


export default function ArtHomePage() {

  const snackbar = useSnackbar();
  const [arts, setArt] = React.useState<Art[]>([]);

  React.useEffect(() => {
    const fetchArts = async() => {
      try {
        const me = await getMe();
        const data = await getArts({artist_id: me.data?.artist_id});
        console.info("Arts");
        console.log(data);
        if (data.success && data.data != null) {
          setArt(data.data);
        } else {
          snackbar("error", "unknown error occured");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchArts();
  }, []);

  return (
    <Stack direction="column" gap={2} sx={{height:"100%"}}>
      <PostActionsBar 
        title={"My Created Arts"}
        actions={[]}
      />
      <DomainDivider color="#fff" />
    <Grid container spacing={1}>
      {
        arts.map((art, index) => {
          return (
            <Grid item xs={3} key={art.art_id}>
              <ArtCard 
                artId={art.art_id}
                title={art.title ?? ""}
                content={art.content ?? ""}
                description={art.description ?? ""}
              />
            </Grid>
          )
        })
      }
      <Grid item xs={3} style={{display : "flex", alignItems : "center", justifyContent: "center"}}>
        <AddArtCard />
      </Grid>
    </Grid>

    </Stack>
  )
}

ArtHomePage.getLayout = (page: React.ReactNode) => {
  return <PostsLayout>{page}</PostsLayout>
}

export async function getStaticProps()  {
  return {
    props : {
      navbar : true
    }
  }
}