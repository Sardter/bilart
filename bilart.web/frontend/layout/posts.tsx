import * as React from "react";
import {
  Stack,
  ButtonGroup,
  Button
} from "@mui/material";
import { useRouter } from "next/router";

export default function PostsLayout({children} : {children: React.ReactNode}) {
  

  const router = useRouter();
  const routeToArts= () => router.replace("/art")
  const routeToTutorials = () => router.replace("/tutorial")
  const active : "art"  | "tutorial" = router.asPath.startsWith("/art") === true ? "art" : "tutorial";

  return (
    <Stack direction="column" gap={2}>
      <ButtonGroup fullWidth>
        <Button  onClick={routeToArts}
          variant={active === "art" ? "contained":"outlined"}
        >
          Art Pieces
        </Button>
        <Button onClick={routeToTutorials}
          variant={active === "tutorial" ? "contained":"outlined"}
        >
          Tutorials
        </Button>
      </ButtonGroup>
      {children}
    </Stack>
  )
}