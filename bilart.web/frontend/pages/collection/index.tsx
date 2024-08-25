import CollectionsLayout from "@/layout/collections";
import * as React from "react";
import { Box, Card, CardActions, CardContent, CardMedia, Chip, Divider, Fab, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { PostActionsBar } from "@/components/shared";
import { Art } from "@/api/api_types";
import { getMe } from "@/api/user";
import { ArtQueryParams, getArts } from "@/api/art";
import { useSnackbar } from "@/store/snackbar";
import { ArtCard } from "@/components/artist";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { AddToPhotos, Check, Clear } from "@mui/icons-material";
import { createNewCollection, getCollections } from "@/api/collection";
import CollectionCard from "@/components/collector/CollectionCard";
import { getFavoriteArts } from "@/api/favorite";

export default function CollectionPage() {

  const snackbar = useSnackbar();
  const [arts, setArts] = React.useState<Art[]>([]);

  /*   const fetchArts = async () => {
      try {
        const me = await getMe();
        if (me.data) {
          const query: ArtQueryParams = {
            collector_id: me.data.user_id
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
    }, []); */

  const router = useRouter();
  const [edit, setEdit] = React.useState<boolean>(false);
  const [collectionName, setCollectionName] = React.useState<string>(""); // collection name
  const [me, setMe] = React.useState<any>({});
  const [artsCount, setArtsCount] = React.useState<any>(0);

  const [collections, setCollections] = React.useState<any>([]);

  const handleCheck = async () => {
    console.log("here");

    if (collectionName.length > 0) {
      try {
        const createdCollection = (await createNewCollection({ name: collectionName })).data;
        setCollectionName('');
        setEdit(false);
        snackbar("success", "Collection created");
        router.push(`/collection/${createdCollection?.collection_id}`);
      } catch (e) {
        snackbar("error", "Failed to create collection");
      }
    }
    else {
      snackbar("error", "Collection name cannot be empty");
    }
  }

  React.useEffect(() => {
    const fetchMe = async () => {
      const data: any = await getMe();
      setMe(data);
    };
    const fetchAllArts = async () => {
      try {
        const resp = await getFavoriteArts();
        setArtsCount(resp.count);
      } catch (e: any) {
        snackbar("error", e.message);
      }
    };
    fetchMe();
    fetchAllArts();
  }, []);

  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log(me.collector_id);
        const resp = await getCollections({ collector_id: me.collector_id });
        console.log(resp);
        setCollections(resp.data);
      } catch (e) {
        console.log(e);
      }
    }
    fetchCollections();
  }, [collections.length]);

  return (
    <>
      <Stack direction="column" gap={2} sx={{ height: "100%" }}>
        <PostActionsBar
          title={"My Collections"}
          actions={[]}
        />
      </Stack>
      <div>
        <Grid container spacing={4}>
          <Grid item xs={6} sm={4} md={3}>
            <Link href={'/collection/favorites'} style={{ maxHeight: '500px', maxWidth: '400px' }}>
              <Card sx={{
                width: "100%", height: '100%', display: 'flex',
                flexDirection: 'column', maxHeight: '500px', maxWidth: '400px'
              }}>
                <CardMedia
                  sx={{ width: "100%", aspectRatio: "1/1" }}
                  style={{

                  }}
                  image={`/app-logo.svg`}
                  title="My favorites"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {"My Favorites"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" overflow={'auto'} maxHeight={'100px'}>
                    {"My favorite art works."}
                  </Typography>
                </CardContent>
                <Box sx={{ marginTop: 'auto' }}>
                  <Divider />
                  <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Chip label={artsCount}></Chip>
                  </CardActions>
                </Box>
              </Card>
            </Link>
          </Grid>

          {
            collections.map((collection: any, index: any) => (
              <Grid item xs={6} sm={4} md={3}>
                <CollectionCard
                  key={index}
                  collection={collection} />
              </Grid>
            ))
          }
        </Grid>

        {
          edit ? (
            <Box position="fixed" right={50} bottom={50} m={2}>
              <TextField
                label="Collection name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                autoFocus
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCheck}>
                        <Check />
                      </IconButton>
                      <IconButton onClick={() => {
                        setCollectionName('');
                        setEdit(false);
                      }}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                style={{ backgroundColor: 'white', borderRadius: '25px' }}
              />
            </Box>
          ) : (
            <Box position="fixed" right={50} bottom={50} m={2}>
              <Link href={"/collection"}>
                <Fab variant="extended" onClick={() => setEdit(true)}>
                  <AddToPhotos sx={{ mr: 1 }} />
                  Create new collection
                </Fab>
              </Link>
            </Box>
          )
        }
      </div>
    </>
  )
}

CollectionPage.getLayout = (page: React.ReactNode) => {
  return <CollectionsLayout>{page}</CollectionsLayout>
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true
    }
  }
}
