import * as React from "react";

import {
  useTheme
} from "@mui/material";

interface DomainDividerProps {
  color? : string
}

export function DomainDivider(props : DomainDividerProps) {

  const theme = useTheme();

  return (
    <div style={{width : "100%", height : "1px", backgroundColor : props.color || theme.palette.background.default}} />
  )
}