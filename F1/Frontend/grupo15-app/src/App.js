import './App.css';
import { useState } from 'react';
import Entrada from './components/Entrada';
import Bot from './components/Bot';
import User from './components/User';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {

  const [messages, setMessages] = useState([]);


  const sendMessage = userMessage => {
    //Primero se agrega el mensaje del usuario a  la lista de mensajes    
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    //A continuación se genera la respuesta del modelo

    //Luego se agrega el mensaje generado del modelo a la lista de mensajes
    //setMessages((prevMessages) => [...prevMessages, modelMessage]);
  }

  return (
    <div className="container-message">
      {messages.map((message, index) => {
        if (index % 2 === 0) {
          return <User key={index}>{message}</User>; // Renderiza un <User>
        } else {
          return <Bot key={index}>{message}</Bot>; // Renderiza un <Bot>
        }
      })}
      <Entrada manejarClic={sendMessage} />
    </div>
  );
}

export default App;
