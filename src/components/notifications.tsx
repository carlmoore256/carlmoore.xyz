import { useRef } from 'react';

export function MessagePopup(props : {
    message : string,
    timeout : number
}) {
    const msgRef = useRef(null);
    setTimeout(() => {
        msgRef.current.style.opacity = 0;
    }, props.timeout);

    return <div className="center-flex">
        <div className="message-popup">
            <p>{props.message}</p>
        </div>
    </div> 
}