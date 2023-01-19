import { useState, useEffect, useRef } from "react";
import { HSVG } from "../components/HSVG";
import "../stylesheets/motif-browser.css";

export function MotifBrowser() {
    const inputFile = useRef(null);
    const [hsvg, setHSVG] = useState<any>();

    const saveSelectedArtworks = () => {
        console.log("saveSelectedArtworks");
    }

    const downloadCollection = () => {
        console.log("downloadCollection");
    }

    const uploadFile = () => {
        // `current` points to the mounted file input element
        console.log("Upload File Clicked");
        inputFile.current.click();
    };

    const onChangeFile = (e : any) => {
        e.stopPropagation();
        e.preventDefault();
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            const text = event.target.result;
            console.log("Loaded text", text);
            setHSVG(<HSVG text={text as string}/>);
        });
        reader.readAsText(file);
    }

    return <div>
        <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={(e) => onChangeFile(e)}/>
        <div className="toolbar" id="top-toolbar">
            <div className="item">
                <button id="upload-hsvg" type="button" onClick={uploadFile}>
                    Upload HSVG
                </button>
            </div>
            <div className="item">
                <button id="save-selection" type="button" onClick={saveSelectedArtworks}>
                    Add To Collection
                </button>
            </div>
            <div className="item">
                <button id="download-collection" type="button" onClick={downloadCollection}>
                    Download Collection
                </button>
            </div>
            
        </div>

        <div className="app-panels">
            <div className="panel motif-browser">
                <h4>Motif Browser</h4>
            </div>
            <div className="panel svg-viewer">
                <h4>SVG Viewer</h4>
                {hsvg}
            </div>
        </div>

    </div>
}
    {/* return <div className="content">
        <h1>Motif Browser</h1>
        <div className="toolbar" id="top-toolbar">
        <div className="item">
            <button id="save-selection" type="button" onClick={"saveSelectedArtworks()"}>
                Add To Collection
            </button>
        </div>
        <div className="item">
            <button id="download-collection" type="button" onclick={"downloadCollection()"}>
                Download Collection
            </button>
        </div>
        <div className="item">
            <label for="show-saved">Show Saved</label>
            <input id="show-saved" type="checkbox" onchange={"toggleShowSavedArtworks()"}>
        </div>
        <div className="item">
            <label for="collection-count">Saved</label>
            <p id="collection-count">0</p>
        </div>
        <div className="item">
            <label for="artworks">Select Artwork</label>
            <select name="artworks" id="art-select" onchange={"onArtworkChange()"}>
    
            </select>
        </div>
        <div className="item">
            <label for="previous">Next Page</label>
            <button id="previous" type="button" onclick="previousPage()">
                Previous
            </button>
        </div>
        <div className="item">
            <label for="next">Next Page</label>
            <button id="next" type="button" onclick="nextPage()">
                Next
            </button>
        </div>

        <div className="item">
            <label for="enable-spin">Enable Spin</label>
            <input id="enable-spin" type="checkbox" onchange="toggleSpin()">
        </div>

        <div className="item">
            <label>Page</label>
            <p id="page-num">0</p>
        </div>

    </div> */}