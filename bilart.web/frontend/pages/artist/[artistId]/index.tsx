import { getArts } from "@/api/art";
import { getMe, getUserById, getUsers } from "@/api/user";
import { ArtCard, CreateArtButton } from "@/components/artist";
import { GalleryView } from "@/components/shared/GalleryView";
import { useSnackbar } from "@/store/snackbar";
import { userAtom } from "@/store/user";
import { Grid } from "@mui/material";
import { useAtom } from "jotai";
import * as React from "react";
import { useRouter } from 'next/router';
import { Art } from "@/api/api_types";
/* 
export type Art = {
  art_id : number;
  artist_id : number;
  content: string;
  created_at: string;
  description: string;
  post_id: number;
  price: number;
  title: string;
} */


export default function ArtistPage() {

  const snackbar = useSnackbar();
  const [arts, setArt] = React.useState<Art[]>([]);
  const router = useRouter();
  const { artistId } = router.query;

  React.useEffect(() => {
    const fetchArts = async () => {
      try {
        const id = Number(artistId);
        if (isNaN(id)) { return; }
        console.log(artistId);
        const data = await getArts({ artist_id: id });
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
    if (artistId) {
      fetchArts();
    }
    
  }, [artistId]);
  
  console.log("id: " + artistId);
  
  const ArtCards = React.useMemo(() => {
    const artcards = arts.map((art, index) => {
      return (
        <ArtCard
          key={index}
          artId={art.art_id}
          title={art.title ?? ""}
          content={art.content ?? ""}
          description={art.description ?? ""}
        />
      )
    });
    return artcards;
  }, [arts]);

  return (
    <Grid container gap={3}>
      {
        React.Children.toArray(
          ArtCards.map((card) => {
            return (
              <Grid item xs={3}>
                {card}
              </Grid>
            )
          })
        )
      }
    </Grid>
  )
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true
    }
  }
}

export async function getStaticPaths() {
  // Replace this with your code to fetch artist IDs
  /* const users = await getUsers({}); // Pass an empty object as the argument
  console.log(users.data);
  const paths = users?.data?.map((user) => ({
    params: { id: user.artist_id.toString() },
  })); */

  return { paths: [], fallback: true };
}
