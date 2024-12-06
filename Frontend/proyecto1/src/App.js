import React, { useState } from 'react';
import { FaRegCopy } from 'react-icons/fa';
import './App.css'; // Importamos el archivo de estilos

const ChatApp = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Nuevo estado para controlar el indicador de escritura

  const defaultResponses = ['Hola', '¿Cómo estás?', 'Bienvenido'];

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    setIsTyping(true); // Activamos el estado de "IA escribiendo"

    const randomResponse =
      defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

    setTimeout(() => {
      // Simulamos un retraso en la respuesta de la IA
      setChatHistory([
        ...chatHistory,
        { question: inputValue, response: randomResponse },
      ]);
      setInputValue('');
      setIsTyping(false); // Desactivamos el estado de "IA escribiendo"
    }, 1500); // Tiempo de retraso en milisegundos (1.5 segundos)
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert('¡Texto copiado al portapapeles!'),
      () => alert('Error al copiar el texto.')
    );
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">IA</h2>
      <div className="chat-history">
        {chatHistory.map((item, index) => (
          <div key={index} className="chat-message">
            <div className="message-section question">
              <p>
                <strong>Pregunta:</strong> <p>{item.question}</p>
              </p>
              <FaRegCopy
                onClick={() => copyToClipboard(item.question)}
                className="copy-icon"
              />
            </div>
            <div className="message-section response">
              <p>
                <strong>Respuesta:</strong> <p>{item.response}</p>
              </p>
              <FaRegCopy
                onClick={() => copyToClipboard(item.response)}
                className="copy-icon"
              />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            {/* Indicador de "IA escribiendo" */}
            <p>IA escribiendo...</p>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
