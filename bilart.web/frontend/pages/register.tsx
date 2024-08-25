import Link from "next/link";

import * as React from "react";
import {
  Stack, 
  useTheme,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import {styled} from "@mui/system";

import { useSnackbar } from "@/store/snackbar";

import {
  FilledInputField, 
  DomainImage, 
  DomainDivider, 
  DomainButton,
  DomainImageUpload
} from "@/components/shared";
import { useRouter } from "next/router";
import { createNewUser, loginUser } from "@/api/user";
import { User } from "@/api/api_types";
import { postFormData } from "@/api/crude";
import { profile } from "console";

const RegisterStack = styled(Stack)(({theme}) => ({
  background : theme.palette.primary.main,
  width : "fit-content",
  position : "absolute",
  top : "50%",
  left : "50%",
  transform : "translate(-50%, -50%)",
  padding : "1.5rem 3rem",
  borderRadius : "5px",
  alignItems : "center",
  boxShadow : "2px 2px 2px 2px black",
})) as typeof Stack;


export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();

  const [firstname, setFirstname] = React.useState<string>("");
  const [lastname, setLastname] = React.useState<string>("");

  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword]  = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [profileImg, setProfileImg] = React.useState<Blob | null>(null);


  const [registering, setRegistering] = React.useState<boolean>(false);

  const snackbar = useSnackbar();


  React.useEffect(() => {
    setUsername("");
    setPassword("");
    setRegistering(false);
  }, [])

  const handleRegister = async () => {
    const newUser: Partial<User> = {
      username : username,
      password: password,
      first_name: firstname,
      last_name: lastname,
      email: email
    }

    createNewUser(newUser as User)
    .then(() => {
      return loginUser(username, password);
    })
    .then(data => {
      if (profileImg !== null) {
        const profileImgUrl = "http://localhost:8000/users/profile-image";
        const formData = new FormData();
        formData.append("image", profileImg);
        return postFormData(profileImgUrl, formData);
      }
      return data;
    })
    .then(data => {
      snackbar("success", "Account was registered");
      router.replace("/login");      
    })
    .catch(err => {
      console.error(err);
      snackbar("error", "An error occured. Please try again later.");
    })
  }

  return (
    <>
      {
        registering && 
        <div
          style={{
            position : "absolute",
            inset : "0",
            backgroundColor : "rgba(0,0,0,0.5)",
            zIndex : 999,
            display : "flex",
            justifyContent : "center",
            alignItems : "center"
          }}
        >
          <CircularProgress
            color="primary" 
            size={80}
            thickness={3}
          />
        </div>
      }
      <RegisterStack
        gap={2}
      >
        <DomainImage 
          src="/app-logo.svg"
          alt="bilart logo"
        />
        <DomainDivider />
        <Grid container gap={0.5} justifyContent="space-between">
          <Grid item xs={5.75}> 
            <FilledInputField
              disabled={registering}
              placeholder="First Name"
              label="First Name"
              fullWidth
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              multiline={false}
              size="small"
              background={theme.palette.primary.light}
              hoverbackground={theme.palette.secondary.light}
              focusedbackground={theme.palette.secondary.light}
              labelColor={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={5.75}>
            <FilledInputField 
              disabled={registering}
              placeholder="Last Name"
              label="Last Name"
              fullWidth
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              multiline={false}
              size="small"
              background={theme.palette.primary.light}
              hoverbackground={theme.palette.secondary.light}
              focusedbackground={theme.palette.secondary.light}
              labelColor={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={5.75}>
            <FilledInputField
              disabled={registering}
              placeholder="Username"
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              multiline={false}
              size="small"
              background={theme.palette.primary.light}
              hoverbackground={theme.palette.secondary.light}
              focusedbackground={theme.palette.secondary.light}
              labelColor={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={5.75}>
            <FilledInputField 
              disabled={registering}
              placeholder="Email"
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              multiline={false}
              size="small"
              background={theme.palette.primary.light}
              hoverbackground={theme.palette.secondary.light}
              focusedbackground={theme.palette.secondary.light}
              labelColor={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12}>
            <FilledInputField 
              disabled={registering}
              type="password"
              placeholder="Password"
              label="Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              multiline={false}
              size="small"
              background={theme.palette.primary.light}
              hoverbackground={theme.palette.secondary.light}
              focusedbackground={theme.palette.secondary.light}
              labelColor={theme.palette.secondary.main}
            />
          </Grid>
      </Grid>
        <DomainImageUpload 
          onImageFinal={(imgSrc, imgBlob)=> setProfileImg(imgBlob)}
          justifyContent="left"
        />

        <div>
          <DomainButton 
            variant="contained"
            onClick={handleRegister}
            domainType="primary"
            text="Register Account"
            disabled={registering}
          />

          <Link href={"/login"}>
            <Button
              disabled={registering}
              variant="text"
              color="secondary"
              sx={{
                textTransform : "none",
                width : "fit-content"
              }}
            >
              or Log In 
            </Button>
          </Link>
        </div>
      </RegisterStack>
    </>
  )

}