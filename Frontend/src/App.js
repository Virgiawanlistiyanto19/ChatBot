import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [paused, setPaused] = useState(false);

  const typingInterval = useRef(null);
  const currentTextRef = useRef("");
  const fullTextRef = useRef("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setPaused(false);
    currentTextRef.current = "";
    fullTextRef.current = "";

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      fullTextRef.current = data.reply;
      startTyping();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Terjadi kesalahan koneksi." },
      ]);
      setIsTyping(false);
    }
  };

  const startTyping = () => {
    typingInterval.current = setInterval(() => {
      if (paused) return;

      const fullText = fullTextRef.current;
      let currentText = currentTextRef.current;
      currentText = fullText.substring(0, currentText.length + 1);
      currentTextRef.current = currentText;

      setMessages((prev) => {
        const updated = [...prev];
        const aiIndex = updated.findIndex((m) => m.sender === "ai-typing");

        if (aiIndex >= 0) {
          updated[aiIndex].text = currentText;
        } else {
          updated.push({ sender: "ai-typing", text: currentText });
        }

        return updated;
      });

      if (currentText === fullText) {
        clearInterval(typingInterval.current);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender === "ai-typing" ? { ...msg, sender: "ai" } : msg
          )
        );
        setIsTyping(false);
      }
    }, 30);
  };

  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);
  const handleClearChat = () => {
    clearInterval(typingInterval.current);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setPaused(false);
  };

  return (
    <div className="container">
      <h1>Customer Service</h1>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="text-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">💬 Sedang mengetik...</div>}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          placeholder="Tulis pertanyaan atau keluhan Anda..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping && !paused}
        />
        <button type="submit" disabled={isTyping && !paused}>Kirim</button>
      </form>

      <div className="control-buttons">
        {isTyping && !paused && (
          <button onClick={handlePause} className="pause">⏸ Jeda</button>
        )}
        {isTyping && paused && (
          <button onClick={handleResume} className="resume">▶️ Lanjutkan</button>
        )}
        <button onClick={handleClearChat} className="clear">🗑 Hapus Chat</button>
      </div>
    </div>
  );
}

export default App;
