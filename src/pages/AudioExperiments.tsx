import { useRef } from 'react';
import { AudioFeatureVisualizer } from "../components/AudioFeatureVisualizer"

// const DEFAULT_AUDIO = "audio/451-unavailable-for-legal-reasons-4.wav"
const DEFAULT_AUDIO = "audio/TriskelionHyperop2.mp3"

export function AudioExperiments() {
    const mountRef = useRef(null);

    return <div className="content">
        <AudioFeatureVisualizer
            mountRef={mountRef}
            audioSrc={DEFAULT_AUDIO}
            dimensions={{width: window.innerWidth, height: window.innerHeight}}
        />
    </div>
}