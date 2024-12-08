import React, { useEffect, useState } from 'react';
import { FaRegCopy } from 'react-icons/fa';
import './App.css'; // Importamos el archivo de estilos
import * as tf from '@tensorflow/tfjs';

const ChatApp = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Nuevo estado para controlar el indicador de escritura

  //Cargamos el modelo
  const [model, setModel] = useState(null);
  const [inputTokenizer, setInputTokenizer] = useState(null);
  const [response, setResponse] = useState('');
  const [targetTokenizer, setTargetTokenizer] = useState(null);
  const [loading, setLoading] = useState(false); // Estado para "IA escribiendo..."


  const defaultResponses = ['Hola', '¿Cómo estás?', 'Bienvenido'];

  // Cargar el modelo al montar el componente
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('./model/model.json');
        setModel(loadedModel);
        console.log('Modelo cargado exitosamente: ');
        console.log(loadedModel.summary());

      } catch (error) {
        console.error('Error al cargar el modelo:', error);
      }
    };
    loadModel();
  }, []);

  // Tokenizer simulado para este ejemplo
  const tokenizer = {
    word_index: {
      'sos': 1,
      'eos': 2,
      'hello': 3,
      'hi': 4
      // Agrega las demás palabras de tu tokenizador aquí
    },
    index_word: {
      1: 'sos',
      2: 'eos',
      3: 'hello',
      4: 'hi'
      // Agrega las demás palabras de tu tokenizador aquí
    },
    texts_to_sequences: (texts) => {
      return texts.map(text => {
        return text.split(' ').map(word => this.word_index[word] || 0); // 0 es el valor para palabras desconocidas
      });
    }
  };

  // Función para generar la respuesta del chatbot
  const generateResponse = async (inputSeq) => {
    if (!model) {
      setResponse("Cargando el modelo...");
      return;
    }

    // Asegurarse de que el modelo esté cargado
    setLoading(true);

    try {
      // Codificar la entrada para obtener los estados del encoder
      const encoderModel = model.getLayer('encoder_model');
      const encoderInputTensor = tf.tensor(inputSeq);
      const statesValue = await encoderModel.predict(encoderInputTensor).array();

      // Inicializar la secuencia objetivo con el token de inicio (SOS)
      let targetSeq = [tokenizer.word_index['sos']];
      let response = [];
      let stopCondition = false;

      // Generar la respuesta palabra por palabra
      while (!stopCondition) {
        // Predecir con el modelo decoder
        const decoderModel = model.getLayer('decoder_model');
        const output = await decoderModel.predict([tf.tensor([targetSeq]), ...statesValue]).array();

        // Obtener el índice del token de la distribución de salida
        const sampledTokenIndex = output[0][0];

        // Obtener la palabra correspondiente
        const sampledToken = tokenizer.index_word[sampledTokenIndex] || '.';

        // Agregar la palabra a la respuesta
        response.push(sampledToken);

        // Condición de salida: token de fin de secuencia o longitud máxima
        if (sampledToken === 'eos' || response.length > 30) { // Ajusta el max length si es necesario
          stopCondition = true;
        }

        // Actualizar la secuencia objetivo con el token muestreado
        targetSeq = [sampledTokenIndex];

        // Actualizar los estados del decoder
        statesValue = output.slice(1);
      }

      setResponse(response.join(' '));

    } catch (error) {
      console.error("Error al generar la respuesta:", error);
      setResponse("Error al generar respuesta");
    }

    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    setLoading(true); // Muestra "IA escribiendo..."
    const response = await generateResponse(inputValue); // Genera respuesta del modelo
    setLoading(false);

    // Actualiza el historial del chat
    setChatHistory([...chatHistory, { question: inputValue, response }]);
    setInputValue('');
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
