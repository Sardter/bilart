import { useRouter } from "next/router"
import { getFavoriteArts } from "@/api/favorite";
import { useState, useEffect } from "react";
import { Box, Button, Divider, Fab, Grid, Typography } from "@mui/material";
import { SelectableArtCard } from "@/components/artist/SelectableArtCard";
import { ArtCard } from "@/components/artist";
import { addToCollection } from "@/api/collection";
import { useSnackbar } from "@/store/snackbar";
import { getCollection } from "@/api/collection";
import { getArts } from "@/api/art";
import { deleteFromCollection } from "@/api/collection";

export default function EditCollection() {
    const router = useRouter();
    const [collectionName, setCollectionName] = useState<string>(""); // collection name
    const { collectionId }: any = router.query;
    const [allArts, setAllArts] = useState<any>([]); // all arts in db
    const [collectionArts, setCollectionArts] = useState<any>([]);
    const [selectedArts, setSelectedArts] = useState<any>([]);
    const [selectedArtsInCollection, setSelectedArtsInCollection] = useState<any>([]); // arts in collection that are selected
    const snackbar = useSnackbar();

    const handleCancel = () => {
        router.push(`/collection/${collectionId}`);
    }

    const handleOk = async () => {
        try {
            for (let i = 0; i < selectedArts.length; i++) {
                const element = selectedArts[i];
                await addToCollection({ collection_id: +collectionId, art_id: element })
            }
            for (let i = 0; i < collectionArts.length; i++) {
                const element = collectionArts[i];
                if (!selectedArtsInCollection.some((art: any) => art.art_id == element.art_id)) {
                    await deleteFromCollection({ collection_id: +collectionId, art_id: element.art_id })
                }
            }
            router.push(`/collection/${collectionId}`);
        } catch (e) {
            snackbar("error", "Failed to add arts to collection")
            console.log(e);
        }
    }

    useEffect(() => {
        const fetchCollectionArts = async () => {
            try {
                console.log("collectionId: ", collectionId);

                const resp = await getArts({ collection: +collectionId });
                setCollectionArts(resp.data);
                setSelectedArtsInCollection(resp.data);
            } catch (e) {
                console.log(e);
            }
        }
        const fetchAllArts = async () => {
            try {
                const resp = await getFavoriteArts();
                setAllArts(resp.data);
            } catch (e) {
                console.log(e);
            }
        }
        const fetchCollection = async () => {
            try {
                const resp = await getCollection(collectionId);
                if (resp.data) {
                    setCollectionName(resp.data.name);
                }
                else {
                    snackbar("error", "Failed to fetch collection")
                    throw new Error("Failed to fetch collection");
                }
            } catch (e) {
                console.log(e);
            }
        }
        if (collectionId) {
            fetchCollection();
            fetchCollectionArts();
            fetchAllArts();
        }

    }, [collectionId]);

    const artsNotInCollection = allArts.filter(
        (art: any) => !collectionArts.some((collectionArt: any) => collectionArt.art_id === art.art_id)
    );

    return (
        <div>
            <Box display="flex" justifyContent="space-between" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Typography variant="h3" style={{ marginBottom: '20px' }}>{collectionName}</Typography>
                <Box>
                    <Button onClick={handleCancel} style={{ maxHeight: '50px', marginLeft: '20px', marginRight: '20px' }}
                        variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} style={{ maxHeight: '50px', marginLeft: '20px', marginRight: '20px'}}
                        variant="contained">
                        Finish Selection
                    </Button>
                </Box> 
            </Box>
            <Grid container spacing={2}>
                {collectionArts.length == 0 ? (
                    <Typography variant="h5" style={{ marginTop: '20px', marginLeft: '20px'}}>You have no artwork in this collection.</Typography>
                ) : (
                    collectionArts.map((art: any, index: any) => (
                        <Grid item xs={6} sm={3} md={3} lg={3} key={index}>
                            <SelectableArtCard
                                key={art.art_id}
                                _artId={art.art_id}
                                _title={art.title ?? ""}
                                _content={art.content ?? ""}
                                _description={art.description ?? ""}
                                _view="public"
                                selected={selectedArtsInCollection.some((selectedArt: any) => selectedArt.art_id === art.art_id)}
                                onSelect={() => {
                                    if (selectedArtsInCollection.some((selectedArt: any) => selectedArt.art_id === art.art_id)) {
                                        setSelectedArtsInCollection(selectedArtsInCollection.filter((selectedArt: any) =>
                                            selectedArt.art_id !== art.art_id));
                                    } else {
                                        setSelectedArtsInCollection([...selectedArtsInCollection, art]);
                                    }
                                }} />
                        </Grid>
                    ))
                )}
            </Grid>
            <Divider style={{ marginTop: '50px' }} />

            <Box display="flex" justifyContent="space-between" style={{ marginTop: '75px', marginBottom: '30px' }}>
                <Typography variant="h3" >Add arts to collection</Typography>
                <Box>
                    <Button onClick={handleCancel} style={{ maxHeight: '50px', marginLeft: '20px', marginRight: '20px'}}
                        variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} style={{ maxHeight: '50px', marginLeft: '20px', marginRight: '20px' }}
                        variant="contained">
                        Finish Selection
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {
                    artsNotInCollection.map((art: any, index: any) => (
                        <Grid item xs={6} sm={3} md={3} lg={3} key={index}>
                            <SelectableArtCard
                                key={art.art_id}
                                _artId={art.art_id}
                                _title={art.title ?? ""}
                                _content={art.content ?? ""}
                                _description={art.description ?? ""}
                                _view="public"
                                selected={selectedArts.includes(art.art_id)}
                                onSelect={() => {
                                    if (selectedArts.includes(art.art_id)) {
                                        setSelectedArts(selectedArts.filter((id: any) => id !== art.art_id));
                                    } else {
                                        setSelectedArts([...selectedArts, art.art_id]);
                                    }
                                }} />
                        </Grid>
                    ))
                }
            </Grid>
        </div>

    )
}

export async function getStaticProps() {
    return {
        props: {
            navbar: true,
            fallback: true
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