import Link from "next/link";
import * as React from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import { CardContent, Typography, useTheme } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';


export function AddArtCard() {
  
  const theme = useTheme();
  
  return (
    <Card sx={{ width: "100%", 
      border: `3px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.primary.light ,
    }}>
      <CardMedia
        sx={{ width: "100%", aspectRatio: "1/1" }}
        image={"/new.png"}
        title="art"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" color="white">
          Create New Art
        </Typography>
        <Typography variant="body2" color="text.secondary">
        </Typography>
      </CardContent>
      <CardActions>
        <Link href={`/art/create`}>
          <Button size="small" startIcon={<LinkIcon style={{fill : theme.palette.primary.main}} />}>Create</Button>       
        </Link>
      </CardActions>
    </Card>
  )
}