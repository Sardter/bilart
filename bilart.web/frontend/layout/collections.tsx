import * as React from "react";
import {
  Stack,
  ButtonGroup,
  Button
} from "@mui/material";
import { useRouter } from "next/router";

export default function CollectionsLayout({children}: {children: React.ReactNode}) {

  const router = useRouter();
  const routeToAllArts = () => router.replace("/collection");
  const routeToGroups = () => router.replace("/collection/groups");
  const active : "collection" | "groups" = router.asPath === "/collection" ? "collection" : "groups";

  return (
    <Stack direction="column" gap={2}>
      <ButtonGroup fullWidth>
        <Button  onClick={routeToAllArts}
          variant={active === "collection" ? "contained":"outlined"}
        >
          Collections
        </Button>
        <Button onClick={routeToGroups}
          variant={active === "groups" ? "contained":"outlined"}
        >
          Arts bought
        </Button>
      </ButtonGroup>
      {children}
    </Stack>
  )

}