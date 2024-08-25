import { getArts } from "@/api/art";
import { getMe } from "@/api/user";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getTutorials } from "@/api/tutorial";
import { Box, Typography, Grid, Stack, Button } from "@mui/material";
import { useTheme } from "@emotion/react";
import { SmallPostCard } from "@/components/artist/SmallArtCard"; // Import SmallArtCard component
import Avatar from "@mui/material/Avatar";
import { getUserById } from "@/api/user";
import { useRef } from 'react';


export default function ProfilePage() {

    const myRef = useRef(null);
    const theme = useTheme();
    const router = useRouter();
    const { userId } = router.query;

    const [arts, setArts] = useState<any>([]);
    const [tutorials, setTutorials] = useState<any>([]);
    const [me, setMe] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchArts = async () => {
            try {
                if (userId) {
                    const data = await getArts({ artist_id: Number(userId) });
                    if (data.success && data.data != null) {
                        setArts(data.data);
                    } else {
                        console.log("error");
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };
        const fetchTutorials = async () => {
            try {
                if (userId) {
                    const data = await getTutorials({ artist_id: Number(userId) });
                    if (data.success && data.data != null) {
                        setTutorials(data.data);
                    } else {
                        console.log("error");
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        const fetchUser = async () => {
            try {
                if (userId) {
                    const data = await getUserById(Number(userId));
                    if (data.success && data.data != null) {
                        setUser(data.data);
                    } else {
                        console.log("error");
                    }
                }
            } catch (err) {
                console.log(err);
            }
        };
        const fetchMe = async () => {
            try {
                const data = await getMe();
                if (data.success && data.data != null) {
                    setMe(data.data);
                } else {
                    console.log("error");
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchUser();
        fetchMe();
        fetchArts();
        fetchTutorials();
    }, [arts.length, tutorials.length, userId]);

    return (
        <Box display="flex" p={2}>
            <Stack direction="column" marginLeft={'200px'} gap={2} sx={{ height: "100%" }}>
                <div style={{ marginBottom: '15px' }}>
                    {
                        arts.length !== 0 ? (
                            <>
                                <Typography variant="h3">Arts</Typography>
                                <Box flexBasis="75%" maxHeight={'600px'} overflow="auto" pr={2}>
                                    <Grid container spacing={2}>
                                        {arts.map((art: any) => (
                                            <Grid item xs={12} sm={6} md={4} lg={4} key={art.art_id}>
                                                <SmallPostCard
                                                    title={art.title}
                                                    content={art.content}
                                                    id={art.art_id}
                                                    type='art'
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </>
                        ) : (
                            <Typography variant="h5">No arts found for <strong>{user?.username}</strong>.</Typography>
                        )
                    }

                </div>
                <div>
                    {
                        tutorials.length !== 0 ? (
                            <>
                                <Typography variant="h3">Tutorials</Typography>
                                <Box flexBasis="75%" maxHeight={'600px'} overflow="auto" pr={2}>
                                    <Grid container spacing={2}>
                                        {tutorials.map((tutorial: any) => (
                                            <Grid item xs={12} sm={6} md={4} lg={4} key={tutorial.tutorial_id}>
                                                <SmallPostCard
                                                    title={tutorial.title}
                                                    content={tutorial.media}
                                                    id={tutorial.tutorial_id}
                                                    type='tutorial'
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </>
                        ) : (
                            <Typography variant="h5">No tutorials found for <strong>{user?.username}</strong>.</Typography>
                        )
                    }

                </div>
            </Stack>
            <Stack direction="column" alignItems={'center'} justifyContent="center" flexGrow={1} sx={{ height: "100%" }}>
                <Typography marginBottom='30px' variant="h3">About</Typography>
                {user && (
                    <>
                        <Avatar src={user.profile_image} alt={user.name} sx={{ width: 100, height: 100, marginBottom: '15px' }} />
                        <Typography variant="h4" marginBottom={'15px'}><strong>{user.username}</strong></Typography>
                        <Typography variant="h5" marginBottom={'50px'}>{user.first_name + " " + user.last_name}</Typography>
                        <Typography variant="h5" marginBottom={'15px'}>{user.email}</Typography>
                        <Typography variant="h5" marginBottom={'15px'}>{user.bio}</Typography>
                        {!isNaN(user.phone) && <Typography variant="h5" marginBottom={'15px'}>{user.phone}</Typography>}
                        {user.user_id === me?.user_id && <Button><a href="/profile/edit">Edit Profile</a></Button>}
                    </>
                )}
            </Stack>
        </Box>
    );
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