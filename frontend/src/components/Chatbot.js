import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const toggleChatbot = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:8080/api/chatbot', {
        message: input,
      });

      // Check if the response contains the expected data
      if (response.data && response.data.response) {
        const botMessage = { sender: 'bot', text: response.data.response };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to server.' },
      ]);
    }
  };

  const renderMessages = () =>
    messages.map((msg, index) => (
      <div
        key={index}
        className={`p-3 my-1 rounded-lg text-sm max-w-[80%] ${
          msg.sender === 'user'
            ? 'bg-blue-500 text-white self-end'
            : 'bg-gray-200 text-black self-start'
        }`}
      >
        {msg.text}
      </div>
    ));

  return (
    <>
      <div
        className="fixed bottom-14 right-5 bg-red-800 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-red-600"
        onClick={toggleChatbot}
      >
        💬
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="bg-red-800 text-white flex justify-between items-center p-3">
            <h4 className="text-lg">Chatbot</h4>
            <button
              className="text-white hover:text-gray-200"
              onClick={toggleChatbot}
            >
              ✖
            </button>
          </div>
          <div
            className="p-3 flex-grow overflow-y-auto flex flex-col space-y-2"
            style={{ maxHeight: '300px', scrollBehavior: 'smooth' }}
          >
            {renderMessages()}
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-100">
            <input
              type="text"
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;