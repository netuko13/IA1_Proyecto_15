import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [tokenizerInput, setTokenizerInput] = useState({});
  const [tokenizerTarget, setTokenizerTarget] = useState({});
  const [model, setModel] = useState(null);
  const [inputSequence, setInputSequence] = useState("");
  const [prediction, setPrediction] = useState("");

  // Función para cargar los tokenizers
  const loadTokenizers = async () => {
    try {
      const inputRes = await fetch("/tokenizer_input.json");
      const targetRes = await fetch("/tokenizer_target.json");
      const inputTokenizer = await inputRes.json();
      const targetTokenizer = await targetRes.json();

      setTokenizerInput(inputTokenizer);
      setTokenizerTarget(targetTokenizer);

      console.log("Tokenizers cargados.");
    } catch (error) {
      console.error("Error al cargar los tokenizers:", error);
    }
  };

  // Función para cargar el modelo de TensorFlow.js
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel("/model/model.json");
      setModel(loadedModel);
      console.log("Modelo cargado correctamente.");
    } catch (error) {
      console.error("Error al cargar el modelo:", error);
    }
  };

  // Cargar tokenizers y modelo cuando el componente se monta
  useEffect(() => {
    loadTokenizers();
    loadModel();
  }, []);

  // Función para convertir texto a secuencia de tokens
  const textToSequence = (text, tokenizer, maxLen = 10) => {
    // Convertir texto a tokens usando el tokenizer
    const tokens = text
      .toLowerCase()
      .split(" ")
      .map((word) => tokenizer[word] || tokenizer["<unk>"]); // Token desconocido
  
    // Padding: Agregar ceros al final hasta que alcance maxLen
    while (tokens.length < maxLen) {
      tokens.push(0);
    }
  
    // Truncar si excede maxLen
    return tokens.slice(0, maxLen);
  };

  // Función para convertir secuencia de tokens a palabras
  const sequenceToText = (sequence, tokenizer) => {
    const invertedTokenizer = {};
    Object.keys(tokenizer).forEach((word) => {
      invertedTokenizer[tokenizer[word]] = word;
    });

    return sequence.map((token) => invertedTokenizer[token] || "<unk>").join(" ");
  };

  // Función para predecir usando el modelo
  const predict = async () => {
    if (!model || Object.keys(tokenizerInput).length === 0) {
      alert("Modelo o tokenizers no cargados todavía.");
      return;
    }
  
    // Entrada: tokens de la frase input
    const inputTokens = textToSequence(inputSequence, tokenizerInput, 10); // Longitud 10
  
    // Target: Inicia con el token especial '<start>'
    const startToken = tokenizerTarget["<start>"] || 1; // Valor por defecto si no existe <start>
    let targetTokens = [startToken];
  
    // Asegurarnos de que la secuencia de salida tenga longitud 10
    while (targetTokens.length < 10) {
      targetTokens.push(0);  // Padding hasta longitud 10
    }
  
    console.log("Secuencia de entrada:", inputTokens);
    console.log("Secuencia target ajustada:", targetTokens);
  
    // Crear tensores con la forma correcta
    const inputTensor = tf.tensor2d([inputTokens], [1, 10]);  // Entrada [1, 10]
    const targetTensor = tf.tensor2d([targetTokens], [1, 10]);  // Salida [1, 10]
  
    // Pasar ambos tensores como entrada al modelo
    const predictionTensor = model.predict([inputTensor, targetTensor]);
  
    // Obtener predicción
    const predictedIndices = predictionTensor.argMax(-1).dataSync();
    const predictedText = sequenceToText(Array.from(predictedIndices), tokenizerTarget);
  
    setPrediction(predictedText);
    console.log("Predicción:", predictedText);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Demo de Tokenizers y Modelo TensorFlow.js</h1>

      <div>
        <label>Escribe tu texto de entrada:</label>
        <input
          type="text"
          value={inputSequence}
          onChange={(e) => setInputSequence(e.target.value)}
          placeholder="Escribe algo aquí..."
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
        />
        <button onClick={predict} style={{ padding: "10px", cursor: "pointer" }}>
          Predecir
        </button>
      </div>

      {prediction && (
        <div>
          <h2>Predicción:</h2>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default App;
