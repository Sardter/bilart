import * as React from "react";
import {
  Stack,
  ButtonGroup,
  Button
} from "@mui/material";
import { useRouter } from "next/router";

export default function HomeLayout({children} : {children: React.ReactNode}) {
  

  const router = useRouter();
  const routeToArts= () => router.replace("/home")
  const routeToTutorials = () => router.replace("/home/tutorial")
  const active : "art"  | "tutorial" = router.asPath === "/home" ? "art" : "tutorial";

  return (
    <Stack direction="column" gap={2}>
      <ButtonGroup fullWidth>
        <Button  onClick={routeToArts}
          variant={active === "art" ? "contained":"outlined"}
        >
          Arts
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