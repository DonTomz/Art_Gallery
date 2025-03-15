import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ARViewer() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const artworkUrl = searchParams.get('artwork');
    const artworkSize = searchParams.get('size'); // in meters

    useEffect(() => {
        // Initialize AR.js scene when component mounts
        const sceneEl = document.createElement('a-scene');
        sceneEl.setAttribute('embedded', '');
        sceneEl.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');

        // Create marker
        const marker = document.createElement('a-marker');
        marker.setAttribute('preset', 'hiro');

        // Create artwork entity with received parameters
        const artwork = document.createElement('a-image');
        artwork.setAttribute('src', artworkUrl);
        artwork.setAttribute('width', artworkSize);
        artwork.setAttribute('height', artworkSize * (9/16)); // maintain aspect ratio
        artwork.setAttribute('position', '0 0.1 0');
        artwork.setAttribute('rotation', '-90 0 0');

        // Create camera
        const camera = document.createElement('a-entity');
        camera.setAttribute('camera', '');

        // Assemble the scene
        marker.appendChild(artwork);
        sceneEl.appendChild(marker);
        sceneEl.appendChild(camera);

        // Add to DOM
        document.body.appendChild(sceneEl);

        // Cleanup
        return () => {
            document.body.removeChild(sceneEl);
        };
    }, [artworkUrl, artworkSize]);

    return (
        <div className="ar-instructions fixed inset-x-0 bottom-0 p-4 bg-black bg-opacity-50 text-white text-center">
            <p>Point your camera at the HIRO marker to see the artwork in AR</p>
            <a 
                href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
            >
                Click here to view the marker
            </a>
        </div>
    );
}

export default ARViewer;
