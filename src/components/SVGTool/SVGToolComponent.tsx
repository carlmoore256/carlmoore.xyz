import { useRef, useState, useEffect } from 'react';
import { ControlPanelNew, 
        Incrementor, 
        ControlPanelProps, 
        Toggle, 
        TextInput, 
        CTRL_PANL_RIGHT } from '../ControlPanel';

export function SVGToolComponent() {

    const [showFull, setShowFull] = useState<boolean>(false);
    const test = useState<boolean>(false);

    return <>
        <div className='content prevent-select' style={{height: '100vh'}}>
            <ControlPanelNew>
                <Toggle
                    key="panel-full"
                    label="Full"
                    state={showFull}
                    setState={setShowFull}/>
            </ControlPanelNew>
        </div>
    </>
}