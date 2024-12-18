import React from "react";
import "../stylesheets/Bot.css"

export default function Bot(props) {

  return (
    <div className="bot-container">
      <label className="title-conversation">Modelo:</label>
      <label className="message-conversation">{props.children}</label>
    </div>
  );
}