import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [model, setModel] = useState(null);

  // Cargar el modelo TensorFlow.js
  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadLayersModel('./tfjs_model/model.json',false);
      loadedModel.summary();
      setModel(loadedModel);
    };
    
    loadModel();
  }, []);

  // Función para preprocesar la entrada del usuario
  const preprocessInput = (inputText) => {
    // Aquí convertimos la entrada (en este caso, un solo valor) a un tensor de 10 elementos
    // Si el modelo espera un array de 10 elementos por cada entrada, puedes extender la entrada.
    // Este ejemplo asume que estamos trabajando con un único valor numérico
    const processedInput = new Array(10).fill(parseFloat(inputText) || 0); // Aseguramos que es un número
    return processedInput;
  };

  // Función para generar la respuesta usando el modelo
  const generateResponse = async () => {
    if (!model || input.trim() === '') {
      return;
    }

    const processedInput = preprocessInput(input);

    // Convertir la entrada a tensor con la forma [1, 10] (1 muestra, 10 características)
    const inputTensor = tf.tensor([processedInput], [1, 10]);

    // Realizar la predicción
    const prediction = model.predict(inputTensor);

    // Suponiendo que la salida es un valor único, extraemos ese valor
    // Puedes necesitar ajustar esto según la estructura exacta de la salida de tu modelo.
    const outputText = prediction.dataSync()[0]; // Ajusta según el tipo de salida que tenga tu modelo

    setResponse(outputText);
  };

  return (
    <div>
      <h1>Chatbot</h1>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Escribe tu pregunta" 
      />
      <button onClick={generateResponse}>Enviar</button>
      <p>Respuesta: {response}</p>
    </div>
  );
};

export default Chatbot;
