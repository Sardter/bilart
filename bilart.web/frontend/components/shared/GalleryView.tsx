import * as React from "react";

import {
  Grid,
  CardProps
} from "@mui/material";


interface CardView extends CardProps {
    cards : React.ReactNode[]
}

export function GalleryView( props: CardView ) {

    return(
        <Grid container gap={3} justifyContent="space-between">
            {props.cards?.map((element, index) => (
                <Grid item xs={3} key={index}>
                    {element}
                </Grid>
            ))}
        </Grid>
    )
};
