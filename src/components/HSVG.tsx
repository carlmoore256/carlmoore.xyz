import React, { useState, useEffect } from 'react';

export interface IHSVGProps {
    text: string;
}

export interface IHSVGState {
    image: any;
}


export class HSVG extends React.Component<IHSVGProps, IHSVGState> {

    constructor(props : IHSVGProps) {
        super(props);
        
        let blob = new Blob([props.text], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(blob);
        let image = document.createElement('img');
        image.src = url;
        image.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});
        
        this.state = {image};
    }

    handleChange = (event: any) => {
        this.setState({image: event.target.value});
    };
    
    render() {
        return <div>
            {this.state.image}
        </div>
    }
}