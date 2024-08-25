import { Tutorial } from "@/api/api_types";
import { getTutorials } from "@/api/tutorial";
import { getTags } from "@/api/tags";
import { useSnackbar } from "@/store/snackbar";
import * as React from "react";
import {
  ListItemIcon, IconButton, Select, MenuItem, FormControl,
  InputLabel, Chip, Button, Menu, Grid, Tooltip, Typography, Divider,
  Fab, Box, Stack, TextField
} from '@mui/material';
import { useAtom } from "jotai";
import { accountTypeAtom, useToggleAccountType } from "@/store/accounttype";
import { ArrowUpward, ArrowDownward, Tune, Sell, Collections, Search, School } from "@mui/icons-material";
import Link from "next/link";
import { Art } from "@/api/api_types";
import HomeLayout from "@/layout/home";
import { TutorialCard } from "@/components/tutorial/TutorialCard";
import { BACKEND_URL } from "@/routes";


export default function TutorialsHomePage() {

  const snackbar = useSnackbar();
  const [tutorials, setTutorials] = React.useState<Tutorial[]>([]);
  const [tags, setTags] = React.useState<any>([]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorEl2, setAnchorEl2] = React.useState<null | HTMLElement>(null);

  const [tag, setTag] = React.useState<string | null>(null);
  const [searchTitle, setSearchTitle] = React.useState<string>('');

  const handleClickTag = (event: any) => {
    setAnchorEl2(event.currentTarget)
  };

  const handleCloseTag = (val: any) => {
    console.log(val);

    setTag(val);
    setAnchorEl2(null);
  };


  const fetchTutorials = async () => {
    try {
      const res = await getTutorials({
        tag_name: tag || undefined,
        search__title: searchTitle.trim().length !== 0 ? searchTitle : undefined
      });
      if (res.success && res.data !== null) {
        setTutorials(res.data);
      } else {
        snackbar("error", "failed to get tutorials");
      }
    } catch (err) {
      snackbar("error", "an error occured");
      console.error(err);
    }
  }

  const fetchTags = async () => {
    try {
      const resp = await getTags({});
      if (resp.success && resp.data != null) {
        setTags(resp.data);
      } else {
        snackbar("error", "Couldn't fetch tags");
      }
    } catch (err) {
      console.log(err);
    }
  }


  React.useEffect(() => {
    fetchTutorials();
    fetchTags();
  }, [tutorials.length, tag])

  const searchTitleDebouncRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (searchTitleDebouncRef.current) clearTimeout(searchTitleDebouncRef.current);
    searchTitleDebouncRef.current = window.setTimeout(fetchTutorials, 200);
  }, [searchTitle])

  return (
    <div style={{ alignContent: 'center' }}>
      <Stack direction="row" sx={{ marginBottom: '20px' }} justifyContent="space-between">
        <div>
          <TextField
            label="Search By Title"
            placeholder="Search By Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            size="small"
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
          <Tooltip title="Filter by tags">
            <Button variant="contained" endIcon={<Sell />} onClick={handleClickTag} style={{ minWidth: 150 }}>
              Tags
            </Button>
          </Tooltip>
          <Menu
            anchorEl={anchorEl2}
            id="tags-menu"
            open={Boolean(anchorEl2)}
            onClose={() => setAnchorEl2(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleCloseTag(null)}>
              <em>None</em>
            </MenuItem>
            {
              tags.map((tag: any, index: any) => (
                <MenuItem key={index} value={tag.tag_name} onClick={() => handleCloseTag(tag.tag_name)}>
                  {tag.tag_name}
                </MenuItem>
              ))
            }
          </Menu>

        </div>
      </Stack>
      <Grid container spacing={2}>
        {
          React.Children.toArray(
            tutorials.map((tutorial, index) => {
              return (
                <Grid item xs={3} key={tutorial.post_id}>
                  <TutorialCard
                    title={tutorial.title!}
                    description={tutorial.description!}
                    content={tutorial.media!}
                    tutorialId={tutorial.tutorial_id}
                    search={true}
                    searchTitle={searchTitle}
                    view="public"
                  />
                </Grid>

              )
            })
          )
        }
      </Grid>
      <Box mt={3} sx={{ position: 'fixed', bottom: 50, right: 75 }}>
        <Fab variant="extended">
          <Link href="/tutorial/create">
            <School sx={{ mr: 1 }} />
            Create tutorial
          </  Link>
        </Fab>
      </Box>
    </div>
  )

}

TutorialsHomePage.getLayout = (page: React.ReactNode) => {
  return <HomeLayout>{page}</HomeLayout>
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true,
      fallback: true
    }
  }
} 