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

function Home() {
  const sampleArtworks = [
    {
      title: "Sunset Bliss",
      artist: "Jane Doe",
      description: "A serene sunset over the ocean, with soft colors blending in the sky.",
      price: "200",
      imageUrl: "E:\Projects\Art_Gallery\frontend\src\images\sunset.jpeg",
      category: "painting",
    },
    {
      title: "Modern Sculpture",
      artist: "John Smith",
      description: "A contemporary sculpture with abstract shapes.",
      price: "500",
      imageUrl: "https://example.com/sculpture.jpg",
      category: "sculpture",
    },
    {
      title: "Digital Dream",
      artist: "Alice Art",
      description: "A digital artwork featuring futuristic themes and vibrant colors.",
      price: "300",
      imageUrl: "https://example.com/digital.jpg",
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
