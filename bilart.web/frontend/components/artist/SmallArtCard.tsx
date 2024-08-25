import Link from "next/link";
import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import { Divider, Box, useTheme, Typography } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { DomainImage } from "../shared";

interface PostCardProps {
    title: string;
    content: string;
    id: number;
    type: 'art' | 'tutorial';
}

export function SmallPostCard({ title, content, id, type }: PostCardProps) {

    const theme = useTheme();

    return (
        <Link href={type === 'art' ? (`/public/art/${id}`) : (`/public/tutorial/${id}`)}>
            <Card sx={{
                width: "100%",
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `3px solid ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.primary.light
            }}>
                <CardMedia
                    sx={{ width: "100%", aspectRatio: "1/1", padding: "0.5rem" }}
                    title="art"
                >
                    <DomainImage
                        src={`http://localhost:8000/${content}`}
                        alt="art image"
                    />

                </CardMedia>
                <Box sx={{ marginTop: 'auto' }}>
                    <Divider />
                </Box>
                <Typography textAlign={'center'} gutterBottom variant="h5" component="div" color="white">
                    {title}
                </Typography>
            </Card>
        </Link>
    );
}
