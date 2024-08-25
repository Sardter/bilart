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
  title: string;
  content: string;
  description: string;
  artId: number;
  view? :"public" | "private";
  search? : boolean;
  searchTitle?: string;
}

export function ArtCard({ title, content, description, artId, view, search, searchTitle }: ArtCardProps) {

  const theme = useTheme();

  let searchedTitle = <Typography gutterBottom variant="h5" component="div" color="white">{title}</Typography>;
  if (search && searchTitle?.trim().length !== 0) {
    const index = title.indexOf(searchTitle!);
    if (index !== -1) {
      searchedTitle = 
        <Typography gutterBottom variant="h5" component="div" color="white">
          {title.substring(0, index)}
          <span style={{color: theme.palette.secondary.main}}>{searchTitle}</span>
          {title.substring(index+searchTitle!.length)}
        </Typography>
 
    }
  }

  return (
    <Card sx={{ 
      width: "100%",
      minHeight: '100%', 
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
      <CardContent>
        {/* <Typography gutterBottom variant="h5" component="div" color="white"> */}
          {searchedTitle}
        {/* </Typography> */}
        <Typography variant="body2" color="white" overflow={'auto'} maxHeight={'100px'}>
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ marginTop: 'auto' }}>
        <Divider />
        <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href={view && view === "public" ? `/public/art/${artId}` : `/art/${artId}`}>
            <Button size="small" startIcon={<LinkIcon style={{fill: theme.palette.primary.main}} />}>Open</Button>
          </Link>

        </CardActions>
      </Box>
    </Card>
  );
}
