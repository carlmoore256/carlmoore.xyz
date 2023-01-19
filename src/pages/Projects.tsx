import { useState, useEffect } from 'react';

export interface ProjectProps {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
}

const PROJECTS = [
    {
        id: "ascii-js",
        title: "ASCII JS Canvas",
        description: "JS Canvas wrapper for rendering content as text in the browser",
        image: "images/motif.svg",
        link: "homunculi.org/botr"
    },
    {
        id: "list-mix",
        title: "[mixima]",
        description: "'List Mixima' : A series of SVG NFTs hand drawn by Kaliane Van and animated by Carl Moore",
        image: "images/motif.svg",
        link: "homunculi.org/botr"
    },
    {
        id: "botr",
        title: "Back of the Router",
        description: "Algorithmically generated image collages",
        image: "images/19.png",
        link: "homunculi.org/botr"
    }
]

function Project(props : ProjectProps) {

    return <div className="project-item">
        <h2>{props.title}</h2>
        <p>{props.description}</p>
    </div>
}

export function Projects() {

    const [projects, setProjects] = useState<any>();

    useEffect(() => {
        const _projects = [];
        for (const p of PROJECTS) {
            _projects.push(<Project {...p}/>)
        }
        setProjects(_projects);
    }, [])

    return <div className="content">
        <div className="flex-list">
            <h1>All of my projects</h1>
            {projects}
        </div>

    </div>
}