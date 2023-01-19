import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Route, Routes } from "react-router-dom";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Projects } from "./pages/Projects";
import { Resume } from "./pages/Resume";
import { Test } from "./pages/Test";
import { AudioExperiments } from "./pages/AudioExperiments";
import { ASCIIArtPage } from './pages/ASCIIArtPage';
// import { FrontPageArtOptimized } from "./components/ASCIIArtCanvas";
import { ASCIIArtViewer } from "./components/ASCIIArtViewer";
import { useLocation } from "react-router-dom";
import { SVGTool } from './pages/SVGTool';
import { MotifBrowser } from './pages/MotifBrowser';

const HOME_STYLES = [
  {
    root : {
      backgroundColor : "#9d9a59"
    },
    navItem: {
      backgroundColor: "rgba(240, 248, 255, 0.175)"
    },
    navItem_hover: {
      backgroundColor: "#7b1ed371"
    },
    mainBanner: {
      backgroundColor: "#7b1ed371"
    },
    mainBanner_hover: {
      backgroundColor: "#1ed36f71"
    }
  }
]

const DEFAULT_BG = "linear-gradient(#e66465, #9198e5)";
// const DEFAULT_BG = "#000000";
const LOGO_SRC = "images/xyz3.svg";


const activeNav = {backgroundColor: 'black', color: 'white'};
const activeNavStyle = ({ isActive } : any) => isActive ? activeNav : undefined

// const navStyle = ({isActive} : any) => isActive ? "nav-item active poop" : "undefined";

function NavItem(props : {
  to : string,
  text : string,
}) {
  return <>
    <NavLink 
      className="nav-item" 
      style={activeNavStyle} 
      to={props.to}>
        {props.text}
    </NavLink>
  </>
}

interface AppPage {
  route : React.ReactElement,
  navItem? : React.ReactElement,
  callback? : () => void
}

function App() {
  const navRef = useRef<HTMLElement>();
  const location = useLocation();

  // const routes : AppPage[] = [
  //   {
  //     route : <Route path="/" element={<Home/>}/>,
  //     navItem : <NavItem to={"/"} text={"home"}/>
  //   },
  //   {
  //     route : <Route path="/" element={<Home/>}/>,
  //     navItem : <NavItem to={"/"} text={"home"}/>
  //   },
  // ]

  useEffect(() => {
    console.log("Location changed", location);
    // || location.pathname == "/"
    if (location.pathname == "/ascii") {
      document.body.style.background = "#131313";
      document.getElementById("nav-logo").style.filter = "invert(100%)";
      if (navRef.current) {
        navRef.current.style.color = "white";
      }
    } else if (location.pathname == "/svg-tool") {
      document.body.style.background = "#131313";
      document.getElementById("nav-logo").style.filter = "invert(100%)";
      if (navRef.current) {
        navRef.current.style.color = "white";
      }
    } else if (location.pathname == "/motif-browser") {
      document.body.style.background = "rgb(230, 230, 230)";
      document.getElementById("nav-logo").style.filter = "invert(100%)";
      if (navRef.current) {
        navRef.current.style.color = "black";
      }
    } else {
      document.body.style.background = DEFAULT_BG;
      document.body.style.backgroundRepeat = "no-repeat";
      document.getElementById("nav-logo").style.filter = "invert(0%)";
    }
  }, [location]);

  return (<div className="App">
    <nav ref={navRef}>
      <div className="nav-links">
        <ul>
          <li><NavItem to={"/"} text={"home"}/></li>
          <li><a className="nav-item" href="pages/timbre">timbre.paint</a></li>
          <li><NavItem to={"/projects"} text={"projects"}/></li>
          <li><NavItem to={"/resume"} text={"resume"}/></li>
          <li><NavItem to={"/contact"} text={"contact"}/></li>
          <li><NavItem to={"/svg-tool"} text={"svg tool"}/></li>
          <li><NavItem to={"/motif-browser"} text={"motif browser"}/></li>
          <li><NavItem to={"/ascii"} text={"art zone"}/></li>
        </ul>
      </div>
      <div id="nav-logo-container">
        <Link to="/">
          <img src={LOGO_SRC} id="nav-logo"></img>
        </Link>
      </div>
    </nav>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/projects" element={<Projects/>}/>
      <Route path="/resume" element={<Resume/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/test" element={<Test/>}/>
      <Route path="/experiments" element={<AudioExperiments/>}/>
      <Route path="/svg-tool" element={<SVGTool/>}/>
      <Route path="/motif-browser" element={<MotifBrowser/>}/>
      <Route path="/ascii" element={<ASCIIArtPage/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Routes>
    <footer>
      <p style={{opacity: 0.7}}>Ⓒ / 2022 / Carl Moore / </p>
    </footer>
  </div>
  )
}

export default App



{/* <li><NavLink className="nav-item" style={activeNavStyle} to="/">home</NavLink></li>

<li><NavLink className="nav-item" style={activeNavStyle} to="/projects">projects</NavLink></li>
{/* <li><NavLink className="nav-item" style={activeNavStyle} to="/experiments">experiments</NavLink></li>
<li><NavLink className="nav-item" style={activeNavStyle} to="/resume">resume</NavLink></li>
<li><NavLink className="nav-item" style={activeNavStyle} to="/contact">contact</NavLink></li>
<li><NavLink onClick={() => changeBgColor('#ffffff')} className="nav-item" style={activeNavStyle} to="/ascii">ascii art</NavLink></li> */}