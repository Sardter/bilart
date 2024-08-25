import {useRouter} from "next/router";
import * as React from "react";
import { AxiosError } from "axios";
import { AuthError } from "@/api/crude";

import {
  Stack,
  TextField,
  Autocomplete, 
  Box,
  Button,
} from "@mui/material"
import {styled} from "@mui/system"; 
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import { Art, type ApiReuslt } from "@/api/api_types";

const FieldsBox = styled(Box)(({theme}) => ({
  backgroundColor : "#fff", 
  width : "100%", 
  height : "100%", 
  overflowY: "scroll",
  display : "flex",
  flexDirection : "column",
  gap: 15,
  padding : "1rem"
})) as typeof Box;

import { ActionButtonProps, DomainDivider, DomainImageUpload, PostActionsBar } from "@/components/shared";
import { NewArtData, UpdateArtData, createNewArt, updateArt, getArt } from "@/api/art";
import { useSnackbar } from "@/store/snackbar";
import { TagPostModel, TagQueryParams, addTagToPost, deleteTagFromPost, getTags } from "@/api/tags";
import { BACKEND_URL } from "@/routes";
import { Unarchive } from "@mui/icons-material";

export default function CreateArt() {

  const router = useRouter();
  const {edit, art_id} = router.query;
  const snackbar = useSnackbar();

  const originalAssignedTagsRef = React.useRef<string[]>([]);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [assignedTags, setAssignedTags] = React.useState<string[]>([]);
  const [content, setContent] = React.useState<string>("");

  const [art, setArt] = React.useState<Art | null>(null);

  const [imgBlob, setImgBlob] = React.useState<Blob | null>(null);  
  const handleImageFinal = (imgSrc : string, imgBlob : Blob) => {
    setImgBlob(imgBlob);
  }

  const [tags, setTags] = React.useState<string[]>([]);
  React.useEffect(() => {
    const fetchInitData = async() => {
      if (art_id) {
        const artRes = await getArt(Number(art_id));
        if (artRes.data) {
          artRes.data.title && setTitle(artRes.data.title);
          artRes.data.description && setDescription(artRes.data.description);
          setPrice(Number(artRes.data.price));
          artRes.data.content && setContent(artRes.data.content);
          setArt(artRes.data!);
          const queryParams : TagQueryParams = {
            post_id: Number(artRes.data.post_id)
          }
          const tagsRes = await getTags(queryParams);
          setAssignedTags(Object.entries(tagsRes.data!).map(([key, value]) => value.tag_name));
          originalAssignedTagsRef.current = Object.entries(tagsRes.data!).map(([key, value]) => value.tag_name);
        }
      }
    }

    fetchInitData();
  }, [art_id]);

  React.useEffect(() => {
    getTags({})
    .then(res => {
      console.log(res);
      setTags(Object.entries(res.data!).map(([key, value]) => value.tag_name));
    });
  }, []);


  const handleOnSave = async () => {
    if (imgBlob) {
      try {
        const newArt : NewArtData = {
          title: title,
          description: description,
          price: price,
          image: imgBlob,
        };
        const res = await createNewArt(newArt);
        console.log(res);
        assignedTags.forEach(tagName => {
          const categorize : TagPostModel = {
            tag_name: tagName as string,
            post_id: res.data!.post_id
          }
          console.log(categorize);
          addTagToPost(categorize);
        })
        router.replace("/home");
      }catch (err) {
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
      
    } else {
      snackbar("error", "Please upload an image for your art.")
    }
  };

  const handleOnUpdate = async () => {
    const updatedArt : UpdateArtData = {
      title : title,
      description: description
    }
    const unAppliedTags = originalAssignedTagsRef.current.filter(tag => !assignedTags.includes(tag));
    console.log(unAppliedTags);
    const newAppliedTags = assignedTags.filter(tag => !originalAssignedTagsRef.current.includes(tag));
    try {
      const updateRes = await updateArt(Number(art_id), updatedArt);
      // remove unmarked tags
      const unappliedTagsAsync : Promise<ApiReuslt<TagPostModel>>[] = [];
      unAppliedTags.forEach(tag => {
        unappliedTagsAsync.push(deleteTagFromPost({
          tag_name: tag,
          post_id: Number(art?.post_id)
          } as TagPostModel))
      });
      await Promise.allSettled(unappliedTagsAsync);
      const newappliedTagsAsync : Promise<ApiReuslt<null>>[] = [];
      newAppliedTags.forEach(tag => {
        newappliedTagsAsync.push(
          addTagToPost({
          tag_name: tag,
          post_id: Number(art?.post_id)
        }));
      })
      await Promise.allSettled(newappliedTagsAsync);
      snackbar("success", "art edits completed");
      router.back();
    } catch (err) {
      snackbar("error", "art edit failed");
      console.error(err);
    }
  }

  const handleOnCancel = React.useCallback(() => {
    router.replace("/home");
  }, []);


  const handleOnChangeTags = (_ : any , newValues : string[]) => {
    setAssignedTags(newValues);
  };

  const actionButtons = React.useMemo(() => {
    const buttons : ActionButtonProps[] = [];
    if (edit === "true") {
      buttons.push(
        {
          text : "Apply Edit",
          onClick: handleOnUpdate,
          icon : <SaveIcon style={{fill : "white"}} />
        }
      );
    } else {
      buttons.push(
        {
          text : "Save",
          onClick: handleOnSave,
          icon : <SaveIcon style={{fill : "white"}} />
        }
      );
    }
    buttons.unshift(
      {
        text: "Cancel",
        onClick: handleOnCancel,
        icon: <CloseIcon  style={{fill : "white"}} />
      }
    )
    return buttons;
  }, [handleOnSave, edit])

  return(
    <Stack direction="column" gap={2} sx={{height : "100%"}} >
      <PostActionsBar 
        title={edit ? "Edit Post" : "Create Post"}
        actions={actionButtons}
      />
      <DomainDivider color="#fff" />
      <FieldsBox>
        <TextField 
          size="small"
          label={"Art Title"}
          placeholder="Enter Art Title"
          fullWidth={true}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField 
          size="small"
          label={"Art Description"}
          placeholder="Describe your art piece"
          fullWidth={true}
          multiline={true}
          minRows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}

        />
        <TextField 
          size="small"
          label={"Price"}
          placeholder="Starting price of your art piece in TL"
          fullWidth={true}
          type="number"
          required
          value={price}   
          onChange={(e) => setPrice(+(e.target.value))}
          disabled={edit === "true"}
        />
        <Autocomplete
          options={tags}
          multiple
          value={assignedTags!}
          onChange={handleOnChangeTags}  
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
              placeholder="Categorize your art piece"
              variant="outlined"
              size="small"
            />
          )}
        />

        <Button
          variant="outlined"
          disabled
          sx={{
            textTransform : "none"
          }}
        >
          Select Image For your art piece
        </Button>
        {
          edit === "true"? 
          <DomainImageUpload 
            onImageFinal={handleImageFinal}
            justifyContent="left"
            startingSrc={`${BACKEND_URL}/${content}`}
            disabled={edit === "true"}
          />
          :
          <DomainImageUpload 
            onImageFinal={handleImageFinal}
            justifyContent="left"
          />
        }
      </FieldsBox>
    </Stack>
  )
}

export async function getStaticProps()  {
  return {
    props : {
      navbar : true
    }
   }
}