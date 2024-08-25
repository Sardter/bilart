import * as React from "react";
import { Modal, Box, Typography, Button, useTheme, IconButton, Grid, Divider, TextField } from "@mui/material";
import { CreateReportData, createReport } from "@/api/report";
import {styled} from "@mui/system";
import { CloseOutlined } from "@mui/icons-material";
import { useSnackbar } from "@/store/snackbar";

const StyledModal = styled(Modal)(({theme}) => ({
  display : "flex",
  justifyContent : 'center',
  alignItems: 'center',
})) as typeof Modal;

interface ReportModalProps extends Omit<CreateReportData, "content">{
  open: boolean;
  onClose: () => void | Promise<void>;
}

export default function ReportModal(props: ReportModalProps) {

  const theme = useTheme();
  const snackbar = useSnackbar();
  const [content, setContent] = React.useState<string>("");

  const handleReport = async() => {
    try {
      const res = await createReport({
        content: content,
        entity_name: props.entity_name,
        entity_id: props.entity_id
      });       
      if (res.success) {
        snackbar("success", "submitted your report");
      } else {
        snackbar("error", "failed to submit report");
      }
    } catch (err) {
      snackbar("error", "failed to submit report");
      console.error(err);
    } finally {
      props.onClose();
    }
  }

  return (
    <StyledModal
      open={props.open}
    >
      <Box
        style={{
          backgroundColor : theme.palette.background.default,
          padding : "2rem",
          borderRadius : 5,
          width : "30%",
          minWidth : 400
        }}
      >
        <IconButton
          size="small"
          sx={{position : "absolute", top : -10, right :-10, backgroundColor: "red"}}
          onClick={() => props.onClose()}
        >
          <CloseOutlined style={{fill : "white"}} />
        </IconButton>

        <Typography variant="h5" textAlign="center" color="primary">
          Report {props.entity_name}
        </Typography>

        <TextField 
          label="Report"
          placeholder="Enter your reason"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <Button fullWidth variant="contained" color="primary" sx={{marginTop : "10px"}} 
          onClick={handleReport}
        >
          Report
        </Button>
      </Box>
    </StyledModal>
  )
}