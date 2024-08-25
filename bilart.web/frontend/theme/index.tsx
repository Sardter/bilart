import * as React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#28B5A4",
      light : "#91E3DE"      
    },
    secondary: {
      main: "#937200",
      light: "#D9CB53"
    },
    error: {
      main: red[200]
    },
    background: {
      default: "#ffffff"
    }
  }
});

export function MuiThemeProvider(props : any) {

  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}