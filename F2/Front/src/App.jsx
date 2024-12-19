import React, { useState } from 'react';
import DigitalRain from './components/DigitalRain';
import {
  ChatContainer,
  MessageList, Message,
  MessageInput, Button,
  MainContainer, ConversationHeader,
  Avatar, Sidebar
} from '@chatscope/chat-ui-kit-react';
import DownloadIcon from './assets/download-solid.svg';
import avatar_morfeo from './assets/morfeo.png';
import "./themes/_chat_overrides.scss";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hola, ¿cómo puedo ayudarte hoy?",
      sender: "Chatbot",
      direction: "incoming"
    },
  ]);
  
  const [model, setModel] = useState(null);

  // Cargar el modelo al inicio
  React.useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadLayersModel("./tfjs_model/model.json"); // Ruta al modelo
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const handleSendMessage = async (userMessage) => {
    // Agregar el mensaje del usuario al chat
    const newMessage = {
      message: userMessage,
      direction: "outgoing",
    };
    setMessages((prev) => [...prev, newMessage]);

    if (model) {
      // Convertir el mensaje en una entrada para el modelo
      const inputTensor = preprocessMessage(userMessage);

      // Realizar la predicción
      const outputTensor = model.predict(inputTensor);
      const botResponse = processModelOutput(outputTensor);

      // Agregar la respuesta al chat
      const responseMessage = {
        message: botResponse,
        direction: "incoming",
      };
      setMessages((prev) => [...prev, responseMessage]);
    } else {
      console.error("El modelo aún no está cargado.");
    }
  };

  const preprocessMessage = (message) => {
    // Convertir el mensaje en un tensor (ejemplo básico)
    const inputArray = message.split("").map((char) => char.charCodeAt(0) / 255);
    return tf.tensor2d([inputArray], [1, inputArray.length]);
  };

  const processModelOutput = (outputTensor) => {
    // Convertir el tensor de salida a texto (ejemplo básico)
    const outputArray = outputTensor.dataSync();
    return `Respuesta del modelo: ${outputArray[0].toFixed(2)}`; // Ajusta según el modelo
  };

  // Función para manejar el envío de mensajes solo par pruebas
/*  const handleSendMessage = (text) => {

    setMessages([
      ...messages,
      {
        message: text,
        sender: "me",
        direction: "outgoing"
      }
    ]);

    // Simulando la respuesta del chatbot
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, {
        message: "Estoy aquí para ayudarte con cualquier pregunta.",
        sender: "Chatbot",
        direction: "incoming"
      }]);
    }, 1000);
  };*/

  // Función para descargar el chat como archivo .txt
  const handleDownload = () => {
    const chatText = messages.map(msg => `${msg.sender}: ${msg.message}`).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat.txt';
    link.click();
  };

  return (
    
    <div style={{ position:"relative" }}>
      <DigitalRain className="digital-rain-canvas"/>
    
    <div className='chat_div' >
      <div style={{ position: "relative", height: "500px" }}>
        <MainContainer >
          <ChatContainer >
            <ConversationHeader>

              <Avatar
                name="Morfeo"
                src={avatar_morfeo}
              />
              
              <ConversationHeader.Content
                info="Yo sólo puedo mostrarte la puerta..."
                userName="Morfeo"
              />
              <ConversationHeader.Actions>
                <Button onClick={handleDownload}>
                  <img src={DownloadIcon} className='download_icon' alt="Descargar Chat" />
                </Button>
              </ConversationHeader.Actions>
            </ConversationHeader>
            <MessageList>
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  model={msg}
                  className={msg.direction === "incoming" ? "incoming-message" : "outgoing-message"}
                />
              ))}
            </MessageList>
            <MessageInput

              onSend={handleSendMessage}  // Función para manejar el envío
              placeholder="Escribe un mensaje..."
              className='cs-message-input'
              sendButton={false}
              attachButton={false}
            />
          </ChatContainer>
          <Sidebar position="left"  >
            <div id="sidebar_content" className='sidebar'>
              ¡Hola! Aquí algunos temas sobre los que me puedes preguntar:
              <ol>
                <li>
                  Curiosidades y datos interesantes: Cosas como "¿Por qué el cielo es azul?" o "¿Qué es la materia oscura?".
                </li>
                <li>
                  Consejos y recomendaciones: Desde recetas hasta qué series ver.
                </li>
                <li>
                  Ayuda práctica: Preguntas sobre cómo hacer algo específico, ya sea en tecnología, jardinería o cualquier otro tema.
                </li>
                <li>
                  Creatividad: Ideas para proyectos, escritos, o inspiración en general.
                </li>
                <li>
                  Chistes y entretenimiento: Si te quieres distraer o necesitas un buen chiste.
                </li>
                

              </ol>
            </div>
          </Sidebar>
        </MainContainer>
      </div>

    </div>
    </div>
  );
}

export default App;
