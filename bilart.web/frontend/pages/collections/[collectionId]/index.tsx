import { getArts } from '@/api/art';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArtCard } from '@/components/artist';
import { useSnackbar } from '@/store/snackbar';
import { getMe } from '@/api/user';
import { getFavoritePosts } from '@/api/favorite';
import { getFavoriteArts } from '@/api/favorite';
import { Typography, Box, Grid, Fab, Button } from '@mui/material';
import { AddToPhotos, BorderColor } from '@mui/icons-material';
import Link from 'next/link';
import { getCollection } from '@/api/collection';

export default function Collection() {
    const snackbar = useSnackbar();
    const router = useRouter();
    const [colName, setColName] = useState<any>(""); // collection name
    const [favs, setFavs] = useState<any>([]);
    const { collectionId }: any = router.query;

    useEffect(() => {
        const fetchCollection = async () => {
            try {

                if (collectionId == "favorites") {
                    setColName("My Favorites");
                }
                else if (!isNaN(+collectionId)) {
                    const resp = await getCollection(+collectionId);
                    setColName(resp?.data?.name);
                }
            } catch (e: any) {
                console.error(e);
            }
        }
        const fetchAllFavs = async () => { // called if collectionId is favorites
            try {
                //const resp = await getArts({ collector_id: +me.collector_id });
                const resp = await getFavoriteArts();
                setFavs(resp.data);
            } catch (e: any) {
                console.error(e);
            }
        };
        const fetchCollectionFavs = async () => { // called if collectionId is not favorites
            try {
                const resp = await getArts({ collection: +collectionId });
                setFavs(resp.data);
            } catch (e: any) {
                console.error(e);
            }
        }
        if (collectionId) {
            if (collectionId == "favorites") {
                fetchAllFavs();
                console.log("favs: ", favs);

            }
            else if (!isNaN(+collectionId)) {

                fetchCollectionFavs();
            }
            else {
                snackbar("error", `Invalid collection id ${collectionId}`)
                return;
            }
        }
        fetchCollection();
    }, [collectionId]);

    console.log("before return,", colName);
    console.log("bef favs: ", favs);


    return (
        <div>
            <Box display="flex" justifyContent="flex-end">
                <Link href={`/collections`}>
                    <Button variant='contained' style={{ marginRight: '0px' }}>Back to collections</Button>
                </Link>
            </Box>
            {
                (favs.length > 0) ? (
                    <div>
                        <Typography variant="h3" color="textSecondary" marginBottom={'20px'}>{
                            colName}
                        </Typography>
                        <Grid container spacing={4}>
                            {favs.map((art: any, index: any) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <ArtCard
                                        artId={art.art_id}
                                        title={art.title ?? ""}
                                        content={art.content ?? ""}
                                        description={art.description ?? ""}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        minHeight="50vh"
                    >
                        <Typography variant="h2" color="textSecondary" marginBottom={'50px'}>
                            {colName}
                        </Typography>
                        <img src="/collection_empty.jpg" alt="No arts" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                        <Typography variant="h5" color="textSecondary" marginTop={'50px'}>
                            No arts found in this collection
                        </Typography>
                        <Box mt={3}>
                            <Link href={`/collections/${collectionId}/edit`}>
                                <Fab variant="extended">
                                    <AddToPhotos sx={{ mr: 1 }} />
                                    Add arts to collection
                                </Fab>
                            </Link>
                        </Box>
                    </Box>
                )
            }
            {
                collectionId !== "favorites" && favs.length != 0 && (
                    <Box mt={3} sx={{ position: 'fixed', bottom: 50, right: 75 }}>
                        <Link href={`/collections/${collectionId}/edit`}>
                            <Fab color="primary" variant='extended'>
                                <BorderColor sx={{ mr: 1 }} />
                                Edit collection
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

export async function getStaticPaths() {
    return { paths: [], fallback: true };
}