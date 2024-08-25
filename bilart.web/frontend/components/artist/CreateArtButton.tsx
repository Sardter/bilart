import Fab from "@mui/material/Fab";
import Link from "next/link";

const fabStyle = {
    fontFamily: "Roboto Slab",
    fontWeight: "bold",
    fontStyle: "italic",
    background: "#D9CB53",
    color: "#937200",
    fontSize: "1.8vw",
    margin: "1vw",
    top: 'auto',
    right: "2vw",
    bottom: "2vw",
    left: 'auto',
    position: 'fixed',
    width: "10vw",
    height: "10vw"
};

export function CreateArtButton(){

    return(
        <Link href="/artist/create">
        <Fab style={fabStyle}>
            Create Art
        </Fab>
    </Link>
    );
}