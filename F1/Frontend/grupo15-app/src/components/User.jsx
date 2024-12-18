import React from "react";
import "../stylesheets/User.css"

export default function User(props) {

  return (
    <div className="user-container">
      <label className="title-conversation">Tú:</label>
      <label className="message-conversation">{props.children}</label>
    </div>
  );
}