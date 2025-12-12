import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001';

const AIVetChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [petInfo, setPetInfo] = useState(null);
  const [showSendToDoctor, setShowSendToDoctor] = useState(false);
  const [summary, setSummary] = useState('');
  const messagesEndRef = useRef(null);

  const quickMessages = [
    "My pet seems sick. What should I do?",
    "When should I vaccinate my pet?",
    "What food is best for my pet?",
    "My pet has unusual behavior. Help!",
    "How often should I take my pet to the vet?"
  ];

  useEffect(() => {
    // Get pet info from localStorage
    const storedPetData = localStorage.getItem('petData');
    const microchipNumber = localStorage.getItem('microchipNumber');
    
    if (storedPetData) {
      const pet = JSON.parse(storedPetData);
      setPetInfo({
        name: pet.name,
        type: pet.type,
        race: pet.race,
        microchip: pet.microchip_number,
        owner: pet.owner_name
      });
    }

    // Load chat history
    if (microchipNumber) {
      loadChatHistory(microchipNumber);
      
      // Send welcome message if no messages exist
      setTimeout(() => {
        if (messages.length === 0) {
          sendWelcomeMessage(microchipNumber);
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (microchipNumber) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/history/${microchipNumber}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendWelcomeMessage = async (microchipNumber) => {
    const welcomeMessage = `Hello! 👋 I'm your AI Veterinary Assistant. I'm here to help you with questions about ${petInfo?.name || 'your pet'}'s health and well-being. 

How can I assist you today? You can ask me about:
- Vaccination schedules
- Health concerns
- Nutrition and diet
- Behavioral issues
- General pet care

Remember, for urgent or serious concerns, please contact your veterinarian directly.`;

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          microchipNumber,
          message: 'Hello',
          petInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev,
          { id: data.userMessage.id, sender: 'user', message: 'Hello', created_at: new Date().toISOString() },
          { id: data.aiMessage.id, sender: 'ai', message: welcomeMessage, created_at: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const microchipNumber = localStorage.getItem('microchipNumber');
    if (!microchipNumber) {
      alert('Pet information not found. Please log in again.');
      navigate('/');
      return;
    }

    setIsLoading(true);
    const userMessage = messageText.trim();
    setInputMessage('');

    // Add user message immediately
    const tempUserMessage = {
      id: Date.now(),
      sender: 'user',
      message: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          microchipNumber,
          message: userMessage,
          petInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMessage.id),
          data.userMessage,
          data.aiMessage
        ]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickMessage = (message) => {
    sendMessage(message);
  };

  const handleSendToDoctor = async () => {
    if (!summary.trim()) {
      alert('Please enter a summary of your conversation');
      return;
    }

    const microchipNumber = localStorage.getItem('microchipNumber');
    if (!microchipNumber) {
      alert('Pet information not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/chat/send-to-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          microchipNumber,
          summary,
          petInfo
        })
      });

      if (response.ok) {
        alert('Message sent to doctor successfully! They will review it and contact you if needed.');
        setShowSendToDoctor(false);
        setSummary('');
      } else {
        throw new Error('Failed to send message to doctor');
      }
    } catch (error) {
      console.error('Error sending to doctor:', error);
      alert('Failed to send message to doctor. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('petData');
    localStorage.removeItem('microchipNumber');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pet-owner/dashboard')}
                className="text-white/70 hover:text-white"
              >
                ← Back to Dashboard
              </button>
              <span className="text-white font-semibold">AI Vet Chat</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSendToDoctor(true)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-white text-sm border border-green-400/30"
              >
                📤 Send to Doctor
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-white/80"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {/* Pet Info Banner */}
        {petInfo && (
          <div className="glass-card p-4 mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐾</span>
              <div>
                <p className="text-white font-semibold">{petInfo.name}</p>
                <p className="text-white/70 text-sm">{petInfo.type} • Microchip: {petInfo.microchip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 glass-card p-4 mb-4 overflow-y-auto space-y-4" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 ? (
            <div className="text-center text-white/70 py-8">
              <p>Starting conversation...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-500/30 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.sender === 'ai' && <span className="text-xl">🤖</span>}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {msg.sender === 'user' && <span className="text-xl">👤</span>}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white rounded-lg p-3">
                <p>AI is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="mb-4">
          <p className="text-white/70 text-sm mb-2">Quick Messages:</p>
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(msg)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm border border-white/20"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 glass-input px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="glass-button px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* Send to Doctor Modal */}
      {showSendToDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Send Conversation to Doctor</h3>
            <p className="text-white/70 mb-4">
              Summarize your conversation with the AI vet. The doctor will review this before your visit.
            </p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter a summary of your conversation and concerns..."
              className="w-full glass-input px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 min-h-[150px]"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowSendToDoctor(false);
                  setSummary('');
                }}
                className="flex-1 glass-button px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToDoctor}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500/30 hover:bg-green-500/40 text-white font-medium border border-green-400/30"
              >
                Send to Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVetChat;

