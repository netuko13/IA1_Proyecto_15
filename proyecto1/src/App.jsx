import React from "react";
import { useState } from "react";
import  "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer,ChatContainer,MessageList,Message,MessageInput } from "@chatscope/chat-ui-kit-react";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hola, ¿en qué puedo ayudarte?",
      sender: "chatbot",
      direction: "incoming"
    }
    
  ]);

  const hadleSendMessage = (myMessage) => {
    setMessages([
      ...messages,
      {
        message: myMessage,
        sender: "me",
        direction: "outgoing"
      }
    ]);

    //const newMessages = [...messages,message];
    //setMessages(newMessages);
  }

  return (
    <>
    <div className="App">
    <MainContainer>
      <ChatContainer>
        <MessageList>
          {messages.map((myMessage, i) => {
            return <Message key={i} model={myMessage}/>
          })}
        </MessageList>
        <MessageInput placeholder="Escribe un mensaje..." onSend={hadleSendMessage} />
      </ChatContainer>  
    </MainContainer>
    </div>
    </>
  )
}

export default App
