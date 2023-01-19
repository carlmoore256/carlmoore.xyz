import { useState, useEffect, useRef} from 'react'
import { incMinMax } from '../helpers';

export const CTRL_PANL_RIGHT : React.CSSProperties = {
    right: "20px", 
    top: "100px", 
    margin: "40px"
}

export interface IncDecPanel {
    title: string;
    incrVal: number;
    min: number | null;
    max: number | null;
}


export function Incrementor(props : {
    label: string,
    state: number,
    setState: (n : number) => void,
    incSettings: {
        changeBy: number,
        min?: number,
        max?: number
    }
}) {
    const {changeBy, min, max} = props.incSettings;
    return <div className='panel prevent-select'>
        <label>{props.label} : {(Math.round(props.state * 100) / 100).toFixed(2)}</label>
        <div>
            <button onClick={() => props.setState(incMinMax(props.state, -changeBy, min, max))}>-</button>         
            <button onClick={() => props.setState(incMinMax(props.state, changeBy, min, max))}>+</button>
        </div>
    </div>
}

export interface Axis2DType {
    x : number,
    y : number
}

// export function Axis2DControl(props : {
//     label: string,
//     state: number,
//     setState: (n : Axis2DType) => void,
//     incSettings: {
//         changeBy: number,
//         min?: number,
//         max?: number
//     }
// }) {
//     const {changeBy, min, max} = props.incSettings;
//     return <div className='panel'>
//         <label>{props.label} : {(Math.round(props.state * 100) / 100).toFixed(2)}</label>
//         <div>
//             <button onClick={() => props.setState(incMinMax(props.state, changeBy, min, max))}>+</button>
//             <button onClick={() => props.setState(incMinMax(props.state, -changeBy, min, max))}>-</button>         
//         </div>
//     </div>
// }

export function Toggle(props : {
    label: string,
    state: boolean,
    setState: (b : boolean) => void
})
{
    // const enbColor = "rgba(255, 255, 255, 0.15)";
    // const disColor = "rgba(0, 0, 0, 0.1)";
    return <div className={props.state ? 'panel enabled' : 'panel' }>
        <label>{props.label} : {props.state ? 'Enabled' : 'Disabled'}</label>
        <div>
            <button 
                onClick={() => props.setState(!props.state)} >
                    {props.state ? 'Disable' : 'Enable'}
                </button>
        </div>
    </div>
}

export function TextInput(props : {
    label : string,
    state : string,
    setState : (s : string) => void,
}) {
    const [textState, setTextState] = useState(props.state);
    return <div className='panel'>
        <input type="text" value={textState} onChange={(e) => setTextState(e.target.value)}/>
        <button onClick={() => props.setState(textState)}>{'Submit'}</button>
    </div>
}

export interface ControlPanelProps {
    // panelRef : any | null;
    panelComponents : any[];
    style: React.CSSProperties | null;
    togglePanel?: boolean;
}

export function ControlPanel(props: ControlPanelProps) {
    // if (!props.panelRef) props.panelRef = useRef();
    const panelRef = useRef();
    const [togglePanel, setTogglePanel] = useState<boolean>(props.togglePanel);

    const opacity = togglePanel ? "100%" : "60%";
    var panelStyle = props.style ? props.style : {};
    panelStyle = {...panelStyle, opacity}

    return <div className="control-panel" ref={panelRef} style={panelStyle}>
        <Toggle
            label="Toggle Panel"
            state={togglePanel}
            setState={setTogglePanel}/>
        <div className="prevent-select" style={{display: togglePanel ? "block" : "none"}}>
            {props.panelComponents}
        </div>
    </div>
}

export function ControlPanelNew(props: {
    style?: React.CSSProperties,
    togglePanel?: boolean,
    children?: React.ReactNode
}) {
    const panelRef = useRef();
    const [togglePanel, setTogglePanel] = useState<boolean>(props.togglePanel);
    const [toggleGrab, setToggleGrab] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState({});
    const [mouseClicked, setMouseClicked] = useState({});
    const panelPos = useRef({x: 0, y: 0});
    const panelPosFlag = useRef(false);

    useEffect(() => {
      const handleMouseMove = (event: any) => {
        setMousePos({ x : event.clientX, y : event.clientY });
      };
      const handleMouseUp = (event: any) => { setToggleGrab(false) }
    //   const handleMouseDown = (event: any) => { setMouseClicked(true) }
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    const opacity = togglePanel ? "100%" : "60%";
    var panelStyle = props.style ? props.style : {};
    panelStyle = {...panelStyle, opacity}


    useEffect(() => {
        console.log("NEW MOUSE STATE", mouseClicked)
    }, [mouseClicked])

    useEffect(() => {
        if (toggleGrab) {
            if (!panelRef.current) return;
            if (panelPosFlag.current) {
                //@ts-ignore
                const {x, y} = panelRef.current.getBoundingClientRect();
                panelPos.current = {x, y};
                panelPosFlag.current = false;
            }
            console.log("mouse is clicked and moving", mousePos);
            //@ts-ignore
            // var rect = 
            //@ts-ignore
            panelRef.current.style.transform = `translate(${mousePos.x-panelPos.current.x}px, ${mousePos.y-panelPos.current.y}px)`;
        }
    }, [mousePos])

    useEffect(() =>  {
        console.log("TOGGLE GRAB", toggleGrab);
        if (!toggleGrab) {
            panelPosFlag.current = true;
        }
    }, [toggleGrab])

    return <div className="control-panel" ref={panelRef} style={panelStyle}>
        <div className="grab-bar" 
            onMouseDown={() => setToggleGrab(true)}
            onMouseUp={() => setToggleGrab(false)}>

        </div>
        <Toggle
            label="Toggle Panel"
            state={togglePanel}
            setState={setTogglePanel}/>
        <div style={{display: togglePanel ? "block" : "none"}}>
            {props.children}
        </div>
    </div>
}