import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Divider, Typography } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import LinkIcon from '@mui/icons-material/Link';
import Link from "next/link";
import { Clear, BorderColor } from "@mui/icons-material";
import { Collection } from "@/api/api_types";
import { getArts } from "@/api/art";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { deleteCollection } from "@/api/collection";
import { useSnackbar } from "@/store/snackbar";

interface CollectionCardProps {
    collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {

    const [open, setOpen] = useState(false);
    const snackbar = useSnackbar();

    const handleDelete = () => {
        try {
            deleteCollection( collection.collection_id );
            setOpen(false);
            router.reload();
        }
        catch (e) {
            snackbar("error", "Failed to delete collection");
            console.log(e);
        }
        setOpen(false);
    };

    const router = useRouter();
    const [artsCount, setArtsCount] = useState<any>(0);
    useEffect(() => {
        const fetchArts = async () => {
            try {
                const resp = await getArts({ collection: collection.collection_id });
                console.log(resp);
                setArtsCount(resp.count);
            } catch (e) {
                console.log(e);
            }
        }
        fetchArts();
    }, []);

    return (

        <div>
            <Card sx={{
                width: "100%", height: '100%', display: 'flex',
                flexDirection: 'column', maxHeight: '520px', maxWidth: '400px'
            }}>
                <Link href={`/collection/${collection.collection_id}`}>
                    <CardMedia
                        sx={{ width: "100%", aspectRatio: "1/1" }}
                        image={`/app-logo.svg`}
                        title="Collection"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {collection.name}
                        </Typography>
                    </CardContent>
                </Link>

                <Box sx={{ marginTop: 'auto' }}>
                    <Divider />
                    <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <Button onClick={() => {
                                router.push(`/collection/${collection.collection_id}`)
                            }}>
                                <LinkIcon style={{ marginRight: '5px' }} />
                                Open
                            </Button>
                            <Button onClick={() => {
                                router.push(`/collection/${collection.collection_id}/edit`)
                            }}>
                                <BorderColor style={{ marginRight: '5px' }} />
                                Edit
                            </Button>
                            <Button onClick={() => setOpen(true)}>
                                <Clear style={{ marginRight: '5px' }} />
                                Delete
                            </Button>
                        </Box>
                        <Chip label={artsCount}></Chip>
                    </CardActions>
                </Box>
            </Card>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>
                    {"Delete collection?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this collection?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}