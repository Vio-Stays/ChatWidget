import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AndroidRoundedIcon from '@mui/icons-material/AndroidRounded';

// ChatWidget Component
const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false); // State to track if the chat is open
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [inputValue, setInputValue] = useState(''); // State to store the input value
  const [isTyping, setIsTyping] = useState(false); // State to show typing indicator
  const [websocket, setWebsocket] = useState(null); // State to store the WebSocket instance
  const messagesEndRef = useRef(null); // Ref to scroll to the bottom of messages

  // Effect to handle WebSocket connection
  useEffect(() => {
    if (isChatOpen && !websocket) {
      const ws = new WebSocket('ws://localhost:8000/webhooks');
      setWebsocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages(prevMessages => [...prevMessages, { text: message.text, sender: 'bot' }]);
        setIsTyping(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };

      return () => {
        ws.close();
      };
    }
  }, [isChatOpen]);

  // Function to open the chat
  const handleChatButtonClick = () => {
    setIsChatOpen(true);
  };

  // Function to close the chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // Function to send a message
  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      const userMessage = { text: inputValue, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputValue('');
      setIsTyping(true);
      websocket.send(JSON.stringify({ text: inputValue }));
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Function to handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Effect to scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div>
      {!isChatOpen && (
        <div id="chat-widget" className="chat-widget">
          <button id="chat-button" className="chat-button" onClick={handleChatButtonClick}>
            <ChatBubbleOutlineRoundedIcon className="chat-icon" />
          </button>
        </div>
      )}

      {isChatOpen && (
        <div id="chat-page" className="chat-page open">
          <div className="chat-header">
            <AndroidRoundedIcon className="bot-icon" />
            <h2 className="chatbot-title">ChatBot</h2>
            <button id="close-chat" className="close-chat" onClick={handleCloseChat}>
              <span className="close-icon">&times;</span>
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender}`}>
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              id="chat-input-field"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button id="send-message" className="send-message" onClick={handleSendMessage}>
              <SendRoundedIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
