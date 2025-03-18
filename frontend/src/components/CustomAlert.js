import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const CustomAlert = ({ message, onClose, type = 'info' }) => {
  const alertStyles = {
    info: {
      backgroundColor: '#e0f7fa',
      borderColor: '#00bcd4',
      textColor: '#00796b',
    },
    success: {
      backgroundColor: '#e8f5e9',
      borderColor: '#4caf50',
      textColor: '#1b5e20',
    },
    error: {
      backgroundColor: '#ffebee',
      borderColor: '#f44336',
      textColor: '#c62828',
    },
  };

  const { backgroundColor, borderColor, textColor } = alertStyles[type] || alertStyles.info;

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className="bg-white p-4 rounded-lg shadow-lg transition-transform transform scale-100 hover:scale-105"
        style={{ border: `2px solid ${borderColor}`, backgroundColor, width: '400px' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {type === 'error' ? (
              <FaExclamationTriangle className={`text-2xl mr-2 ${textColor}`} />
            ) : (
              <FaCheckCircle className={`text-2xl mr-2 ${textColor}`} />
            )}
          </div>
          <FaTimes 
            onClick={onClose} 
            className={`text-xl cursor-pointer text-gray-600 hover:text-gray-800`} 
          />
        </div>
        <p className={`text-gray-800 mb-2`}>{message}</p>
      </div>
    </div>
  );
};

export default CustomAlert;
