import CollectionsLayout from "@/layout/collections";
import * as React from "react";
import {Grid, Stack} from "@mui/material";
import { PostActionsBar } from "@/components/shared";
import { Art } from "@/api/api_types";
import { getMe } from "@/api/user";
import { ArtQueryParams, getArts } from "@/api/art";
import { useSnackbar } from "@/store/snackbar";
import { ArtCard } from "@/components/artist";

export default function CollectionPage() {

  const snackbar = useSnackbar();
  const [arts, setArts] = React.useState<Art[]>([]);

  const fetchArts = async () => {
    try {
      const me = await getMe();
      if (me.data) {
        const query : ArtQueryParams = {
          collector_id : me.data.user_id
        }
        const myArts = await getArts(query);
        myArts.data && setArts(myArts.data);
      } 
    } catch (err) {
      snackbar("error", "failed to fetch your arts");
      console.error("err");
    }
  }

  React.useEffect(() => {
    fetchArts();
  }, []);

  return (
    <>
      <Stack direction="column" gap={2} sx={{height: "100%"}}>
        <PostActionsBar 
          title={"Arts I Bought"}
          actions={[]}
        />
      </Stack>
      <Grid container spacing={2}>
        {
            React.Children.toArray(
              arts.map((art, index) => {
                return (
                  <Grid item xs={3}>
                    <ArtCard
                        key={art.art_id}
                        artId={art.art_id}
                        title={art.title ?? ""}
                        content={art.content ?? ""}
                        description={art.description ?? ""}
                        view="public"
                      />
                  </Grid>
                    
                )
            })
          )
        }
      </Grid>
    </>
  )
}

CollectionPage.getLayout = (page: React.ReactNode) => {
  return <CollectionsLayout>{page}</CollectionsLayout>
}

export async function getStaticProps() {
  return {
    props : {
      navbar : true
    }
  }
}