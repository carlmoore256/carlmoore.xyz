import { useRef, useState } from 'react';
import { MessagePopup } from '../components/notifications';

export function Contact() {

    const [copyMsg, setCopyMsg] = useState(null);


    function copyToClipboard(text : string) {
        navigator.clipboard.writeText(text);
        setCopyMsg(<MessagePopup 
            message={`Copied ${text} to clipboard`}
            timeout={1000}
        />)
    }

    return <div className="content">
        <h1>Contact</h1>
        {copyMsg}
        <div className="flex-list">

            <div className="project-item" onClick={() => copyToClipboard("carlmoore256@gmail.com")}>
                <h4>carlmoore256@gmail.com</h4>
            </div>
            <div className="project-item" onClick={() => window.open("https://github.com/carlmoore256", '_blank')}>
                <h4>github.com/carlmoore256</h4>
            </div>
            <div className="project-item" onClick={() => window.open("https://linkedin.com/in/carl-moore/", '_blank')}>
                <h4>linkedin.com/in/carl-moore/</h4>
            </div>
            <div className="project-item" onClick={() => window.open("https://linkedin.com/in/carl-moore/", '_blank')}>
                <h4>linkedin.com/in/carl-moore/</h4>
            </div>
        </div>
    </div>
}