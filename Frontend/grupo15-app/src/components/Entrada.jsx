import React, { useState } from "react";

export default function Entrada(props) {
  const [message, setMessage] = useState("");

  return (
    <div>
      <form className="d-flex align-items-center">

        <input
          type="text"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensaje"
        />

        <div className="form-group mx-1 mb-0">
          <button
            type="button"
            className="btn btn-primary bi bi-send-fill"
            onClick={() => {
              props.manejarClic(message);
              //borra el mensaje anterior
              setMessage("");
            }}
          />
        </div>
        <div className="form-group mx-1 mb-0">
          <button
            type="button"
            className="btn btn-danger bi bi-trash-fill"
            onClick={() => setMessage("")}
          />
        </div>
      </form>

    </div>
  );
}