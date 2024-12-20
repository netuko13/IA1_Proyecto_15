import React, { useState,useEffect,useRef } from 'react';
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

import * as use from "@tensorflow-models/universal-sentence-encoder";
import { ResponseGenerator } from "./content/ResponseGenerator"

function App() {
  const [dynamicIntents, setDynamicIntents] = useState([]);
  const chatResponseGenerator = useRef(new ResponseGenerator());
  const [messages, setMessages] = useState([ ]);
  
  const [model, setModel] = useState(null);

  //Bajar hasta el ultimo mensaje
  /*useEffect(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, [messages]);*/

  // Cargar el modelo al inicio
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const loadedModel = await use.load();
        setModel(loadedModel);
        //setIsLoading(false);

        // Add initial suggested questions
        setMessages([
          {
            message: "Hola, A la izquierda hay temas que puedes preguntarme.",
            sender: "Chatbot",
            direction: "incoming"
          },
          

        ]);
      } catch (error) {
        console.error("Error initializing TensorFlow.js:", error);
        //setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  const handleSendMessage = async (text) => {
    //e.preventDefault();
    if (!text.trim()) return;

    const newUserMessage = { sender: "user", message: text,direction: "outgoing" };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    //setUserInput("");
    //setIsGeneratingResponse(true);

    try {
      if (model) {
        const response = await generateResponse(text);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Chatbot", message: response,direction: "incoming" },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Chatbot", message: "Model is still loading...",direction: "incoming"  },
        ]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "Chatbot", message: "Sorry, something went wrong.",direction: "incoming"  },
      ]);
    }
  };

  const generateResponse = async (input) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return chatResponseGenerator.current.findBestMatch(input, dynamicIntents);
  };

  const handleFeedback = (messageIndex, feedback) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg, idx) =>
        idx === messageIndex ? { ...msg, feedback } : msg
      )
    );
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
                  Definiciones en ingles: Cosas como "what is charity?" o "what is ford".
                </li>
                <li>
                  Bot conversacional: por ejemplo "hello", what is your name?
                </li>
                <li>
                  Chistes y entretenimiento: Si te quieres distraer o necesitas un buen chiste. Ejemplo: tell me a joke
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
