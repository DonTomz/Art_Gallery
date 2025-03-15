import React from 'react';

const LatestArtworksBanner = ({ artworks }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Latest Artworks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((artwork) => (
          <div key={artwork._id} className="relative group">
            <img
              src={artwork.imageUrl[0]}
              alt={artwork.title}
              className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 rounded-b-lg">
              <h3 className="text-lg font-semibold text-white">{artwork.title}</h3>
              <p className="text-sm text-gray-300">{artwork.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestArtworksBanner; 