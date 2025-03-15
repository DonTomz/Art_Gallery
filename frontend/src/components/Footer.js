import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-500 py-4 text-center w-full">
      <p className="text-sm text-white">
        &copy; 2024 Art Gallery. All rights reserved.
      </p>
      <p className="text-sm text-white">
        Follow us on social media:
      </p>
      <div className="flex justify-center space-x-4">
        <a href="https://facebook.com" className="text-white">Facebook</a>
        <a href="https://twitter.com" className="text-white">Twitter</a>
        <a href="https://instagram.com" className="text-white">Instagram</a>
      </div>
    </footer>
  );
}

export default Footer;
