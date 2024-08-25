import * as React from "react";

import dayjs, { Dayjs } from 'dayjs';
import {
  Modal,
  Box,
  IconButton,
  Grid,
  Typography,
  Button,
  TextField,
  Divider,
  useTheme
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from "@mui/x-date-pickers";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

interface AuctionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (startDate: string, endDate: string) => void;
}


export default function AuctionModal(props: AuctionModalProps) {

  const theme = useTheme();

  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs(new Date().toISOString()));

  React.useEffect(() => {
    setStartDate(new Date());
  }, []);

  const handleCreate = () => {
    props.onCreate(startDate.toISOString(), endDate!.toISOString());
  }

  return (
    <Modal open={props.open} sx={{display: "flex", justifyContent:"center", alignItems:"center"}}>
    <Box
      sx={{
        backgroundColor : "#fff",
        padding : "2rem",
        borderRadius : 5,
        width : "30%",
        minWidth : 400,
        position : "relative"
      }}
    >
      <IconButton
        size="small"
        sx={{position : "absolute", top : -10, right :-10, backgroundColor: "red"}}
        onClick={() => props.onClose()}
      >
        <CloseOutlined style={{fill : "white"}} />
      </IconButton>

      <Grid container gap={2} justifyContent="space-between">
        <Grid item xs={12}>
          <Typography variant="h5" textAlign="center" color="primary">
            Create New Auction
          </Typography>
          <Divider orientation="horizontal" />
        </Grid>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid item xs={5}>
              <DatePicker 
                disabled
                value={dayjs(new Date().toISOString())}
                label="Start Date"
              />
            </Grid>           
            <Grid item xs={5}>
              <DatePicker 
                minDate={dayjs(new Date().toISOString())}
                views={['year', 'month', 'day']}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                label="End Date"
              />
          </Grid>
          </LocalizationProvider>
      </Grid>
      
      <Button fullWidth variant="contained" color="primary" sx={{marginTop : "10px"}} onClick={handleCreate}>
        Create
      </Button>
    </Box>
  </Modal>    

  )
}