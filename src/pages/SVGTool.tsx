import { Link } from "react-router-dom";
import { SVGToolComponent } from "../components/SVGTool/SVGToolComponent";

export function SVGTool() {
    document.title="3D SVG Tool"
    return <>
        <SVGToolComponent/>
    </>
}