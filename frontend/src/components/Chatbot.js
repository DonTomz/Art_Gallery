import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChatbot = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Simple content generation instead of chat
      const result = await model.generateContent(input);
      const response = await result.response;
      
      const botMessage = { 
        sender: 'bot', 
        text: response.text() 
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error connecting to Gemini:", error);
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'bot', 
          text: 'Sorry, I encountered an error. Please try again.' 
        },
      ]);
    } finally {
      setIsLoading(false);
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
        className="fixed bottom-16 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-700 z-[1001]"
        onClick={toggleChatbot}
      >
        <i className="fas fa-comments text-lg"></i>
      </div>

      {isOpen && (
        <div className="fixed bottom-28 right-4 w-72 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-[1001] border border-gray-200">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Chat Assistant</h3>
            <button 
              onClick={toggleChatbot}
              className="text-white hover:text-gray-200"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>

          <div
            className="p-3 flex-grow overflow-y-auto flex flex-col space-y-2"
            style={{ height: '300px' }}
          >
            {messages.length === 0 && (
              <div className="text-gray-500 text-center mt-3 text-sm">
                Send a message to start the conversation!
              </div>
            )}
            {renderMessages()}
            {isLoading && (
              <div className="self-start bg-gray-200 text-black rounded-lg p-2 my-1 text-xs">
                Thinking...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;