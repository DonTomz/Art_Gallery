import React, { useEffect } from 'react';

const ARViewer = () => {
    useEffect(() => {
        const imageUrl = new URLSearchParams(window.location.search).get('image');
        if (imageUrl) {
            const artworkImage = document.getElementById('artworkImage');
            artworkImage.setAttribute('src', imageUrl);
        }
    }, []);

    return (
        <div>
            <a-scene embedded arjs>
                <a-marker preset="hiro">
                    <a-image id="artworkImage" position="0 0 0" rotation="-90 0 0" width="1"></a-image>
                </a-marker>
                <a-entity camera></a-entity>
            </a-scene>
        </div>
    );
};

export default ARViewer;
