import Link from "next/link";
import * as React from "react";

import { useAtom } from "jotai";

import {
  Snackbar,
  Alert,
  AppBar,
  Grid,
  IconButton,
  Badge,
  Avatar,
  Menu,
  useTheme,
  Button,
  Drawer,
  MenuItem,
  Typography,
  Stack,
  Box
} from "@mui/material";
import { styled } from "@mui/system";
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import { getMe } from "@/api/user";
import { AxiosError } from "axios";



import {
  snackbarAtom,
  snackbarMessage,
  snackbarSeverity,
  useSnackbar
} from "@/store/snackbar";

import { DomainImage } from "@/components/shared";
import { BACKEND_URL } from "@/routes";
import { useRouter } from "next/router";
import { AuthError } from "@/api/crude";

import { getNotifications, readNotifications } from "@/api/notfications";
import { NotificationModel } from "@/api/api_types";
import { format } from "path";

export interface LayoutProps {
  show: boolean | undefined;
  children: React.ReactNode
}

const PageContainer = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  flexGrow: 1,
  position: "relative",
  overflowY: "scroll",
  padding: "2rem"
}))

export default function Layout(props: LayoutProps) {
  const router = useRouter();
  const theme = useTheme();

  const [snackbarStatus, setSnackbarStatus] = useAtom(snackbarAtom);
  const [severity, __] = useAtom(snackbarSeverity);
  const [message, ___] = useAtom(snackbarMessage);

  const snackbar = useSnackbar();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [profileImgSrc, setProfileImgSrc] = React.useState<string>("");
  const [meId, setMeId] = React.useState<number>(1);
  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await getMe();
        console.info("Current User");
        console.info(me.data);
        setProfileImgSrc(`${BACKEND_URL}/${me.data?.profile_image}`);
        setMeId(me.data?.user_id ?? 1);
      } catch (err) {
        if (err instanceof AuthError) {
          snackbar("error", "Session does not exist");
          router.replace("/login")
          return;
        }
        if (err instanceof AxiosError && err.response?.status === 401) {
          snackbar("error", "Incorrect username or password");
          router.replace("/login");
        } else {
          snackbar("error", "an error occured. See console for more details");
          console.error(err);
        }
      }
    }

    fetchMe();
  }, []);

  const [notifications, setNotifications] = React.useState<NotificationModel[]>([]);
  const unreadNotificationCount = notifications.filter(notif => notif.read === false).length;

  const [openNotifs, setOpenNotifs] = React.useState<boolean>(false);
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const notifications = res.data;
      if (notifications)
        setNotifications(notifications);
    } catch (err) {
      if (err instanceof AuthError) {
        snackbar("error", "Session does not exist");
        router.replace("/login")
        return;
      }
      if (err instanceof AxiosError && err.response?.status === 401) {
        snackbar("error", "Incorrect username or password");
        router.replace("/login");
      } else {
        snackbar("error", "an error occured. See console for more details");
        console.error(err);
      }
    }
  }

  const handleNotifClose = async () => {
    setOpenNotifs(false);
    try {
      await readNotifications();
    } catch (err) {
      if (err instanceof AuthError) {
        snackbar("error", "Session does not exist");
        router.replace("/login")
        return;
      }
      if (err instanceof AxiosError && err.response?.status === 401) {
        snackbar("error", "Incorrect username or password");
        router.replace("/login");
      } else {
        snackbar("error", "an error occured. See console for more details");
        console.error(err);
      }
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("bilart-me");
    localStorage.removeItem("password");
    router.replace("/login");
  }

  React.useEffect(() => {
    const fetcherInterval = setInterval(fetchNotifications, 500);
    return () => clearInterval(fetcherInterval);
  }, []);

  return (
    <>
      <Snackbar open={snackbarStatus} autoHideDuration={6000} onClose={() => setSnackbarStatus(false)}>
        <Alert onClose={() => setSnackbarStatus(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
      <Drawer
        anchor="right"
        open={openNotifs}
        onClose={handleNotifClose}
      >

        <Stack direction={"column"} width={300}>
          <Typography variant="h5" textAlign="center">Notifications</Typography>
          {
            notifications.reverse().map(notif => <Notification {...notif} />)
          }
        </Stack>
      </Drawer>
      {
        props.show &&
        <AppBar position="static" color="primary" sx={{ height: "fit-content", padding: "0.25rem 0.5rem" }}>
          <Grid container sx={{ width: "100%" }} spacing={1}>
            <Grid item xs={1} sx={{ display: "flex", alignItems: "center" }}>
              <Link href={'/home'}>
                <DomainImage
                  alt="bil art"
                  src="/app-logo.svg"
                />
              </Link>
            </Grid>
            <Grid item xs={9} />
            <Grid item xs={2}>
              <div style={{ display: "flex", justifyContent: "right", width: "100%", gap: 5 }}>
                <Link href="/home">
                  <IconButton size="small">
                    <HomeIcon
                      fontSize="large"
                      style={{
                        fill: "#fff"
                      }}
                    />
                  </IconButton>
                </Link>
                <IconButton
                  onClick={() => setOpenNotifs(true)}
                  size="small"
                >
                  <Badge badgeContent={unreadNotificationCount} color="secondary">
                    <NotificationsIcon
                      fontSize="large"
                      style={{
                        fill: "#fff"
                      }}
                    />
                  </Badge>
                </IconButton>
                <Button
                  id="menu-btn"
                  size="small"
                  onClick={handleClick}
                >
                  <Avatar
                    src={profileImgSrc}
                  />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'menu- btn'
                  }}
                >
                  <Link href={`/profile/${meId}`}>
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                  </Link>
                  <Link href="/art">
                    <MenuItem onClick={handleClose}>My Posts</MenuItem>
                  </Link>
                  <Link href="/collection">
                    <MenuItem onClick={handleClose}>My Collections</MenuItem>
                  </Link>
                  <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
                </Menu>
              </div>
            </Grid>
          </Grid>
        </AppBar>
      }
      <PageContainer>
        {props.children}
      </PageContainer>
    </>
  )
}


function Notification(props: NotificationModel) {

  const formatDate = (dateString: string): string => {
    const timestamp = Date.parse(dateString);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const theme = useTheme();
  return (
    <Box sx={{
      margin: "0.5rem",
      borderRadius: 5,
      padding: 2,
      border: "1px dashed black",
      backgroundColor: props.read ? "none" : theme.palette.primary.main
    }}>
      <Typography>
        {props.content}
      </Typography>
      <Typography variant="body2">
        {formatDate(props.created_at)}
      </Typography>
    </Box>
  )

}   