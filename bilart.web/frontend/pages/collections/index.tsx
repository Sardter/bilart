import { Fab, Box, Typography, CardMedia, Card, CardContent, Divider, CardActions, TextField, Grid, Chip, InputAdornment, IconButton } from "@mui/material"
import { accountTypeAtom, useToggleAccountType } from "@/store/accounttype";
import { AddToPhotos, ThumbUpAlt, ThumbUpOffAlt, Check, Clear } from "@mui/icons-material";
import LinkIcon from '@mui/icons-material/Link';
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { getCollections } from "@/api/collection";
import { getArts } from "@/api/art";
import { getMe } from "@/api/user";
import { useSnackbar } from "@/store/snackbar";
import { useRouter } from "next/router";
import CollectionCard from "@/components/collector/CollectionCard";
import { getFavoriteArts } from "@/api/favorite";
import { createNewCollection } from "@/api/collection";
import { getCollection } from "@/api/collection";

export default function CollectionsPage() {

    const snackbar = useSnackbar();
    const router = useRouter();
    const [accountType] = useAtom(accountTypeAtom);
    const [edit, setEdit] = useState<boolean>(false);
    const [collectionName, setCollectionName] = useState<string>(""); // collection name
    const toggleAccountType = useToggleAccountType();
    const [me, setMe] = useState<any>({});
    const [artsCount, setArtsCount] = useState<any>(0);

    const [collections, setCollections] = useState<any>([]);

    const handleCheck = async () => {
        console.log("here");

        if (collectionName.length > 0) {
            try {
                const createdCollection = (await createNewCollection({ name: collectionName })).data;
                setCollectionName('');
                setEdit(false);
                snackbar("success", "Collection created");
                router.push(`/collections/${createdCollection?.collection_id}`);
            } catch (e) {
                snackbar("error", "Failed to create collection");
            }
        }
        else {
            snackbar("error", "Collection name cannot be empty");
        }
    }

    useEffect(() => {
        if (accountType == "artist") {
            toggleAccountType();
        }
        else if (accountType != "collector") {
            snackbar("error", "Internal server error");
        }
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

    useEffect(() => {
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
        <div>
            <Typography variant="h2" marginBottom={'20px'}>My Collections</Typography>
            <Grid container spacing={4}>
                <Grid item xs={6} sm={4} md={3}>
                    <Link href={'/collections/favorites'} style={{ maxHeight: '500px', maxWidth: '400px' }}>
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
                        <Link href={"/collections"}>
                            <Fab variant="extended" onClick={() => setEdit(true)}>
                                <AddToPhotos sx={{ mr: 1 }} />
                                Create new collection
                            </Fab>
                        </Link>
                    </Box>
                )
            }
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

