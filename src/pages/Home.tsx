// import { ASCIIArtViewer } from "../components/ASCIIArtViewer";
import { FrontPageArt } from "../components/FrontPageArt";
import { ASCIIArtPage } from "./ASCIIArtPage";
import { Link } from "react-router-dom";

export function Home() {
    document.title="Carl Moore | Portfolio"
    return <>
        <FrontPageArt/>
        <Link to="/projects">
            <div className="main-banner no-select">
                    <h4>View Projects</h4>
            </div>
        </Link>
    </>
}