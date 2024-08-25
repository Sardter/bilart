import * as React from "react";
import type { Art, Bid, Tag, Auction, User } from "@/api/api_types";
import { useRouter } from "next/router";
import {
  Avatar,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
  useTheme,
  Box
} from "@mui/material";
import { getAuction } from "@/api/auction";
import { useSnackbar } from "@/store/snackbar";
import { getArt } from "@/api/art";
import { createNewBid, getBids } from "@/api/bid";
import { getTags } from "@/api/tags";
import { DomainDivider, DomainImage, PostActionsBar } from "@/components/shared";
import { getUserById } from "@/api/user";
import { BACKEND_URL } from "@/routes";
import { getMe } from "@/api/user";

type BidUser = {
  bid: Bid;
  collector: User;
}
const AuctionPage: React.FC = () => {
  const router = useRouter();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { query } = router;
  const auctionId = query.id;

  const [art, setArt] = React.useState<Art>();
  const [auction, setAuction] = React.useState<Auction>();

  const [bidUsers, setBidUsers] = React.useState<BidUser[]>([]);

  const [bidCount, setBidCount] = React.useState<number>(0);
  const [tags, setTags] = React.useState<Tag[]>([]);

  const[myBid, setMyBid] = React.useState<string>("");

  const fetchArt = async (auction: Auction): Promise<Art | null> => {
    try {
      const data = await getArt(auction.art_id);
      console.log(data);
      if (data.success && data.data != null) {
        setArt(data.data);
        return data.data;
      } else {
        snackbar("error", "unknown error occured");
      }
    } catch (err) {
      console.log(err);
    }
    return null;
  };
  const fetchAuction = async (): Promise<Auction | null> => {
    try {
      const data = await getAuction(Number(auctionId));
      console.log(data);
      if (data.success && data.data != null) {
        setAuction(data.data);
        return data.data;
      } else {
        snackbar("error", "unknown error occured");
      }
    } catch (err) {
      console.log(err);
    }
    return null;
  };
  const fetchBids = async (auction: Auction) => {
    try {
      const data = await getBids({ auction_id: auction.auction_id, price_order: 'desc' });
      if (data.success && data.data != null) {
        const biddingUsers : BidUser[] = [];
        for(let i = 0; i < data.data.length; i++) {
          const user = await getUserById(data.data[i].collector_id);
          biddingUsers.push({bid: data.data[i], collector: user.data!});
        }
        console.log(biddingUsers);
        setBidUsers(biddingUsers);
        setBidCount(data.count ?? 0);
      } else {
        snackbar("error", "unknown error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchTags = async (art: Art) => {
    try {
      const data = await getTags({ post_id: art.post_id });
      console.log(data);
      if (data.data != null) {
        setTags(data.data);
      } else {
        snackbar("error", "failed to fetched");
      }
    } catch (err) {
      console.log(err);
      snackbar("error", "failed to fetched");
    }
  };

  const fetch = async () => {
    const auction = await fetchAuction();
    if (auction != null) {
      const art = await fetchArt(auction);
      fetchBids(auction);
      if (art != null) {
        fetchTags(art);
      }
    }
  };

  React.useEffect(() => {
    fetch();
  }, [auctionId]);

  const onSelectBid = (bid: Bid) => {
    fetch();
  }

  const formatDate = (dateString: string): string => {
    const timestamp = Date.parse(dateString);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const handlePlaceBid = async () => {
    try {
      const res = await createNewBid({
        price: myBid,
        auction_id: Number(auctionId)
      });
      const auction = await fetchAuction();
      if (auction)
        fetchBids(auction);
    } catch (err) {
      console.error(err);
      snackbar("error","failed to place your bid");
    }
  }

  return (
    <Stack direction="column" gap={2} sx={{ height: "100%", padding: "20px" }}>
      <PostActionsBar 
        title="Auction Management"
        actions={[]}
      />
      <Stack
        direction="column"
        gap={1}
        sx={{ position: "relative", height: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
            {art?.title}
          </Typography>
          <div>
            {React.Children.toArray(
              tags.map((tagname) => (
                <Chip
                  label={tagname.tag_name}
                  sx={{ marginLeft: "10px" }}
                  color="primary"
                />
              ))
            )}
          </div>
        </div>
        <DomainDivider color={theme.palette.primary.main} />
        <Typography variant="h4" sx={{color: theme.palette.primary.main}}>
          TL {art?.price}
        </Typography>

        <div style={{ display: "flex" }}>
          <Typography
            variant="h5"
            sx={{color: theme.palette.primary.main}}
            style={{ paddingRight: "10px" }}
          >
            Auction Status
          </Typography>
          <Chip
            label={auction?.active ? "Active" : "Inactive"}
            color={auction?.active ? "primary" : "secondary"}
            
          />
        </div>
        <DomainDivider color={theme.palette.primary.main} />

        <Typography variant="body1" sx={{color: theme.palette.primary.main}}>
          Staring date: {formatDate(auction?.start_time as any)}
        </Typography>
        <Typography variant="body1" sx={{color: theme.palette.primary.main}}>
          End date: {formatDate(auction?.end_time as any)}
        </Typography>
        <Typography variant="body1" sx={{color: theme.palette.primary.main}}>
          Bid count: {bidCount}
        </Typography>
        <DomainDivider color={theme.palette.primary.main} />
        
        <TextField 
          type="number"
          placeholder="Enter Your Bid"
          value={myBid}
          onChange={(e) => setMyBid(e.target.value)}
        />
        <Button onClick={handlePlaceBid}>
          Place Your Bid
        </Button>
        <Bids bidUsers={bidUsers}/>
      </Stack>
    </Stack>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps() {
  return {
    props: {
      navbar: true,
    },
  };
}

export default AuctionPage;

type BidsProps = {
  bidUsers: BidUser[];
};

const Bids: React.FC<BidsProps> = ({ bidUsers}) => {
  
  const theme = useTheme();
  
  return (
    <Stack direction="column" gap={1}>
     {
      bidUsers.map(({bid, collector : user}, index) => (
        <Stack direction="row" justifyContent="space-between" alignItems="center"
        sx={{width: "100%", backgroundColor: theme.palette.primary.main, padding: "0.5rem 1rem", borderRadius: 50}}
        >
          <div style={{display: "flex", justifyContent: "center", alignItems:"center", gap : 5}}>
            <Avatar 
              src={`${BACKEND_URL}/${user.profile_image}`}
              alt="bidder profile image"
            />
            <Typography color="#fff" component="span">{user.username}</Typography>
          </div>
          <Typography color="white">
            Offering Price: TL {bid.price}
            {
                (index == 0 && (<Chip label={<Typography color="#fff">Highest</Typography>} style={{marginLeft: "10px"}} color="secondary" />))
            }
          </Typography>
            
        </Stack>
      ))
    }
    </Stack>
  );
};