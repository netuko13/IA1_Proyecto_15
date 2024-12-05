import React, { useState } from 'react'; 
import { FaRegCopy } from 'react-icons/fa'; 
import './App.css'; 

// Definimos un componente funcional llamado ChatApp.
const ChatApp = () => {
  
  // Declaramos un estado para manejar el valor del input (pregunta que el usuario escribe).
  const [inputValue, setInputValue] = useState(''); 
  // Declaramos un estado para almacenar el historial de preguntas y respuestas.
  const [chatHistory, setChatHistory] = useState([]); 
  // Creamos un array con respuestas predefinidas que se seleccionarán aleatoriamente.
  const defaultResponses = ['Hola', '¿Cómo estás?', 'Bienvenido']; 
  
  // Función que se ejecuta al enviar un mensaje.
  const handleSendMessage = () => {
    // Si el input está vacío o tiene solo espacios, no hacemos nada.
    if (inputValue.trim() === '') return; 
    
    // Seleccionamos una respuesta aleatoria del array `defaultResponses`.
    const randomResponse =
      defaultResponses[Math.floor(Math.random() * defaultResponses.length)]; 
    
    // Actualizamos el historial del chat agregando la pregunta del usuario y la respuesta generada.
    setChatHistory([
      ...chatHistory, 
      { question: inputValue, response: randomResponse }
    ]); 
    
    // Limpiamos el input después de enviar el mensaje.
    setInputValue(''); 
  };

  // Función para copiar texto al portapapeles.
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert('¡Texto copiado al portapapeles!'), 
      // Mostramos un mensaje de éxito si la copia fue exitosa.
      () => alert('Error al copiar el texto.') 
      // Mostramos un mensaje de error si no se pudo copiar.
    );
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">IA</h2>
      <div className="chat-history">
        {chatHistory.map((item, index) => (
          // Recorremos el historial de chat para renderizar cada pregunta y respuesta.
          <div key={index} className="chat-message">
            <div className="message-section question">
              {/* Sección que muestra la pregunta del usuario */}
              <p><strong>Usuario:</strong> <p>{item.question}</p></p>
              <FaRegCopy 
                onClick={() => copyToClipboard(item.question)} 
                className="copy-icon" 
              />
            </div>
            <div className="message-section response">
              {/* Sección que muestra la respuesta*/}
              <p><strong>IA:</strong> <p>{item.response}</p></p>
              <FaRegCopy 
                onClick={() => copyToClipboard(item.response)} 
                className="copy-icon" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        {/* Contenedor para el input de texto y el botón de enviar */}
        <textarea
          value={inputValue} 
          // Conectamos el valor del input al estado `inputValue`.
          onChange={(e) => setInputValue(e.target.value)} 
          // Actualizamos el estado `inputValue` cada vez que el usuario escribe algo.
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
