import React from 'react';

const WhatsAppChat = () => {
    return (
        <a 
            href="https://wa.me/917736690900" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
                position: 'fixed',
                bottom: '5px',
                right: '20px',
                backgroundColor: '#25D366',
                borderRadius: '45%',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.3s',
                width: '50px',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                zIndex: 1000,
            }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#128C7E'} // Darker green on hover
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'} // Reset to original color
        >
           <i className="fab fa-whatsapp" style={{ color: 'white', fontSize: '25px' }}></i> {/* Ensure this class is correct */}
        </a>
    );
};

export default WhatsAppChat;

