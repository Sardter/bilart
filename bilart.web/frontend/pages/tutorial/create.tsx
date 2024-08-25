import {useRouter} from "next/router";
import * as React from "react";
import { AxiosError } from "axios";
import { AuthError } from "@/api/crude";

import {
  Stack,
  TextField,
  Box,
  Button,
  Autocomplete
} from "@mui/material"
import {styled} from "@mui/system"; 
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import {createNewTutorial, getTutorial, UpdateTutorialData, type NewTutorialData, updateTutorial} from "@/api/tutorial";
import type { Tutorial, ApiReuslt } from "@/api/api_types";
import { TagPostModel, TagQueryParams, addTagToPost, deleteTagFromPost, getTags } from "@/api/tags";


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
import { useSnackbar } from "@/store/snackbar";
import { BACKEND_URL } from "@/routes";

export default function CreateArt() {

  const router = useRouter();
  const {edit, tutorial_id} = router.query;
  const snackbar = useSnackbar();

  const originalAssignedTagsRef = React.useRef<string[]>([]);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState('');
  const [content, setContent] = React.useState<string>("");
  const [assignedTags, setAssignedTags] = React.useState<string[]>([]);
  const [tutorialInfo, setTutorialInfo] = React.useState<Tutorial | null>(null);


  const [imgBlob, setImgBlob] = React.useState<Blob | null>(null);  
  const handleImageFinal = (imgSrc : string, imgBlob : Blob) => {
    setImgBlob(imgBlob);
  }

  const [tags, setTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchInitData = async() => {
      if (tutorial_id) {
        const tutorialRes = await getTutorial(Number(tutorial_id));
        if (tutorialRes.data) {
          tutorialRes.data.title && setTitle(tutorialRes.data.title);
          tutorialRes.data.description && setDescription(tutorialRes.data.description);
          tutorialRes.data.media && setContent(tutorialRes.data.media);
          setTutorialInfo(tutorialRes.data!);
          const queryParams : TagQueryParams = {
            post_id: Number(tutorialRes.data.post_id)
          }
          const tagsRes = await getTags(queryParams);
          setAssignedTags(Object.entries(tagsRes.data!).map(([key, value]) => value.tag_name));
          originalAssignedTagsRef.current = Object.entries(tagsRes.data!).map(([key, value]) => value.tag_name);
        }
      }
    }

    fetchInitData();
    getTags({})
    .then(res => {
      setTags(Object.entries(res.data!).map(([key, value]) => value.tag_name));
    });
  }, [tutorial_id]);

  const handleOnSave = async () => {
    if (imgBlob) {
      try {
        const newTutorial : NewTutorialData = {
          title: title,
          description: description,
          media: imgBlob
        };
        const res = await createNewTutorial(newTutorial);
        assignedTags.forEach(tagName => {
          const categorize : TagPostModel = {
            tag_name: tagName as string,
            post_id: res.data!.post_id
          }
          addTagToPost(categorize);
        })
        router.replace("/tutorial");
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
      snackbar("error", "please upload an image for your art")
    }
  };

  const handleOnUpdate = async () => {
    const updatedTutorial : UpdateTutorialData = {
      title: title,
      description: description,
      post_id: tutorialInfo?.post_id
    } 
    const unAppliedTags = originalAssignedTagsRef.current.filter(tag => !assignedTags.includes(tag));
    const newAppliedTags = assignedTags.filter(tag => !originalAssignedTagsRef.current.includes(tag));
    try {
      const updateRes = await updateTutorial(updatedTutorial);
      const unappliedTagsAsync : Promise<ApiReuslt<TagPostModel>>[] = [];
      unAppliedTags.forEach(tag => {
        unappliedTagsAsync.push(deleteTagFromPost({
          tag_name: tag,
          post_id: Number(tutorialInfo?.post_id)
          } as TagPostModel))
      });
      await Promise.allSettled(unappliedTagsAsync);
      const newappliedTagsAsync : Promise<ApiReuslt<null>>[] = [];
      newAppliedTags.forEach(tag => {
        newappliedTagsAsync.push(
          addTagToPost({
          tag_name: tag,
          post_id: Number(tutorialInfo?.post_id)
        }));
      })
      await Promise.allSettled(newappliedTagsAsync);
      snackbar("success", "updated tutorial info");
      router.back();
      console.log(updateRes);
    } catch (err) {
      snackbar("error", "error occured");
      console.log(err);
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
        title={edit ? "Edit Tutorial" : "Create Tutorial"}
        actions={actionButtons}
      />
      <DomainDivider color="#fff" />
      <FieldsBox>
        <TextField 
          size="small"
          label={"Tutorial Title"}
          placeholder="Enter Tutorial Title"
          fullWidth={true}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField 
          size="small"
          label={"Tutorial Description"}
          placeholder="Describe your tutorial/webinar"
          fullWidth={true}
          multiline={true}
          minRows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}

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
              placeholder="Categorize your tutorial"
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
          Select Media for Tutorial
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