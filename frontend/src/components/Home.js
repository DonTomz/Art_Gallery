// import React, { useState, useEffect } from 'react';

// function Home() {
//   const [artworks, setArtworks] = useState([]);

//   useEffect(() => {
//     async function fetchArtworks() {
//       try {
//         const response = await fetch('http://localhost:5000/api/art/artworks'); // Your API URL
//         const data = await response.json();
//         setArtworks(data);
//       } catch (error) {
//         console.error('Failed to fetch artworks:', error);
//       }
//     }

//     fetchArtworks();
//   }, []);

//   return (
//     <div className="art-gallery">
//       <h1>Featured Artworks</h1>
//       <div className="artworks-container">
//         {artworks.map((artwork) => (
//           <div key={artwork._id} className="artwork-card">
//             <img src={artwork.imageUrl} alt={artwork.title} />
//             <h3>{artwork.title}</h3>
//             <p>{artwork.artist}</p>
//             <p>{artwork.description}</p>
//             <p>{artwork.price}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Home;

import React from 'react';
import './Home.css';
import sunsetImage from '../images/sunset.jpeg';
import sculptureImg from '../images/sculpture.jpg';
import digitalImg from '../images/digital.jpeg';
import reflectionImg from '../images/reflection.jpeg';
import rsculptureImg from '../images/rsculpture.jpeg';
import vrImg from '../images/vr.jpeg';
import ujImg from '../images/jungle.jpeg';
import dreamImg from '../images/dream.jpeg';

function Home() {
  const sampleArtworks = [
    {
      title: "Sunset Bliss",
      artist: "Jane Doe",
      description: "A serene sunset over the ocean, with soft colors blending in the sky.",
      price: "200",
      imageUrl: sunsetImage, 
      category: "painting",
    },
    {
      title: "Modern Sculpture",
      artist: "John Smith",
      description: "A contemporary sculpture with abstract shapes.",
      price: "500",
      imageUrl: sculptureImg,
      category: "sculpture",
    },
    {
      title: "Digital Dream",
      artist: "Alice Art",
      description: "A digital artwork featuring futuristic themes and vibrant colors.",
      price: "300",
      imageUrl: digitalImg,
      category: "digital art",
    },
    {
      title: "Abstract Reflection",
      artist: "Mark Rivers",
      description: "An abstract painting featuring reflective surfaces and geometric patterns.",
      price: "450",
      imageUrl: reflectionImg,
      category: "abstract",
    },
    {
      title: "Rustic Sculpture",
      artist: "Lucas Greene",
      description: "A rustic, handcrafted sculpture made from reclaimed wood and metal.",
      price: "600",
      imageUrl: rsculptureImg,
      category: "sculpture",
    },
    {
      title: "Virtual Reality",
      artist: "Sophia Chang",
      description: "A digital artwork exploring virtual spaces and futuristic designs.",
      price: "400",
      imageUrl: vrImg,
      category: "digital art",
    },
    {
      title: "Urban Jungle",
      artist: "David Lee",
      description: "An urban street sculpture that mixes nature and industrial elements.",
      price: "700",
      imageUrl: ujImg ,
      category: "sculpture",
    },
    {
      title: "Galaxy Dreams",
      artist: "Lily Moon",
      description: "A vibrant digital art piece inspired by galaxies and cosmic wonders.",
      price: "380",
      imageUrl: dreamImg,
      category: "digital art",
    },
  ];

  return (
    <div className="art-gallery">
      <h1>Featured Artworks</h1>
      <div className="artworks-container">
        {sampleArtworks.map((artwork, index) => (
          <div key={index} className="artwork-card">
            <img src={artwork.imageUrl} alt={artwork.title} />
            <h3>{artwork.title}</h3>
            <p><strong>Artist:</strong> {artwork.artist}</p>
            <p>{artwork.description}</p>
            <p><strong>Price:</strong> ${artwork.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
