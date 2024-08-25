import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { ArtCard } from '.';
import Link from "next/link";
import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import { Stack, Divider, CardContent, Typography, Box, useTheme } from '@mui/material';
import { Domain, ThumbUpAlt, ThumbUpOffAlt } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import { DomainImage } from "../shared";

interface ArtCardProps {
    _title: string;
    _content: string;
    _description: string;
    _artId: number;
    _view?: "public" | "private";
    selected: boolean;
    onSelect: any;
}

export function SelectableArtCard({ _title, _content, _description, _artId, _view, selected=true, onSelect }: ArtCardProps) {
    const theme = useTheme();

    return (
        <div style={{ position: 'relative' }}>
            <Card 
            onClick={onSelect}
            sx={{
                width: "100%",
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `3px solid ${theme.palette.primary.main}`,
                backgroundColor: selected ? 'lightblue' : 'white' }}>

                <CardMedia
                    sx={{ width: "100%", aspectRatio: "1/1", padding: "0.5rem" }}
                    title="art"
                >
                    <DomainImage
                        src={`http://localhost:8000/${_content}`}
                        alt="art image"
                    />

                </CardMedia>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {_title}
                    </Typography>
                </CardContent>
                <Box sx={{ marginTop: 'auto' }}>
                    <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
                    </CardActions>
                </Box>
            </Card>
            <Checkbox
                checked={selected}
                onClick={onSelect}
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 48,
                    height: 48,
                    '& .MuiSvgIcon-root': {
                        fontSize: 32, // Adjust the size of the icon
                    },
                }}
            />
        </div>
    );
}
