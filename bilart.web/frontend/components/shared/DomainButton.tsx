import * as React from "react";

import {
  Button,
  ButtonProps,
  useTheme
} from "@mui/material";


interface DomainButtonProps extends Omit<ButtonProps, "sx">{
  domainType : "primary" | "secondary";
  text? : string;
}


export function DomainButton(props : DomainButtonProps) {
  
  const theme = useTheme();
  const buttonProps = props as ButtonProps;

  if (props.domainType === "primary") {
    if (props.text) {
      return (
        <Button
          {...buttonProps}
          sx={{
            textTransform : "none",
            color : theme.palette.secondary.main,
            backgroundColor : theme.palette.primary.light
          }}>
          {props.text}
        </Button>
      )  
    } else {
      return (
        <Button
          {...buttonProps}
          sx={{
            textTransform : "none",
            color : theme.palette.secondary.main,
            backgroundColor : theme.palette.primary.light
          }}
        />
      )
    }    
  } else {
    if (props.text) {
      return (
        <Button
          {...buttonProps}
          sx={{
            textTransform : "none",
            backgroundColor : theme.palette.secondary.main,
            color : theme.palette.primary.light
          }}>
          {props.text}
        </Button>
      )
    } else {
      return (
        <Button
        {...buttonProps}
        sx={{
          textTransform : "none",
          backgroundColor : theme.palette.secondary.main,
          color : theme.palette.primary.light
        }}/>
      )
    }
  }
}