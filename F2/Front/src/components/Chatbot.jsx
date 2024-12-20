import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

const Chatbot = () => {
  const [tokenizerInput, setTokenizerInput] = useState({});
  const [tokenizerTarget, setTokenizerTarget] = useState({});
  const [encoderModel, setEncoderModel] = useState(null);
  const [decoderModel, setDecoderModel] = useState(null);
  const [inputSequence, setInputSequence] = useState("");
  const [prediction, setPrediction] = useState("");

  const maxSeqLength = 10;

  // Función para cargar los tokenizers
  const loadTokenizers = async () => {
    try {
      //Process.env.PUBLIC_URL se asegura de que la ruta sea válida tanto en desarrollo como en producción.
      //const home = process.env.PUBLIC_URL
      const inputRes = await fetch("/tfjs_model/tokenizer_encoder_decoder.json");
      const targetRes = await fetch("/tfjs_model/tokenizer_encoder_decoder.json");
      const inputTokenizer = await inputRes.json();
      const targetTokenizer = await targetRes.json();

      setTokenizerInput(inputTokenizer);
      setTokenizerTarget(targetTokenizer);

      console.log("Tokenizers cargados.");
    } catch (error) {
      console.error("Error al cargar los tokenizers:", error);
    }
  };

  // Función para cargar el modelo del encoder y decoder
  const loadModels = async () => {
    try {
      const encoder = await tf.loadLayersModel("/tfjs_model/model.json");
      const decoder = await tf.loadLayersModel("/tfjs_model/model.json");

      setEncoderModel(encoder);
      setDecoderModel(decoder);
      console.log("Modelos cargados correctamente.");
    } catch (error) {
      console.error("Error al cargar los modelos:", error);
    }
  };

  // Cargar tokenizers y modelos cuando el componente se monta
  useEffect(() => {
    loadTokenizers();
    loadModels();
  }, []);

  // Función para convertir texto a secuencia de tokens
  const textToSequence = (text, tokenizer, maxLen = 10) => {
    const tokens = text
      .toLowerCase()
      .split(" ")
      .map((word) => tokenizer[word] || tokenizer["<unk>"]); // Token desconocido

    while (tokens.length < maxLen) tokens.push(0); // Padding
    return tokens.slice(0, maxLen);
  };

  // Función para convertir secuencia de tokens a texto
  const sequenceToText = (sequence, tokenizer) => {
    const invertedTokenizer = {};
    Object.keys(tokenizer).forEach((word) => {
      invertedTokenizer[tokenizer[word]] = word;
    });
    return sequence.map((token) => invertedTokenizer[token] || "<unk>").join(" ");
  };

  // Función principal para generar la predicción
  const generateResponse = async () => {
    if (!encoderModel || !decoderModel) {
      alert("Modelos no cargados todavía.");
      return;
    }

    // Entrada: tokens de la frase input
    const inputTokens = textToSequence(inputSequence, tokenizerInput, 10);
    const inputTensor = tf.tensor2d([inputTokens]); // Tensor para el encoder

    // ----------------------- ENCODER -----------------------
    // Obtiene los estados iniciales del encoder
    const encoderOutputs = encoderModel.predict(inputTensor);
    let stateH = encoderOutputs[0]; // Estado h
    let stateC = encoderOutputs[1]; // Estado c

    // ----------------------- DECODER -----------------------
    const startToken = tokenizerTarget["start"] || 2; // Token de inicio
    const endToken = tokenizerTarget["end"] || 1; // Token de finalización

    let targetSeq = tf.tensor2d([[startToken]]); // Secuencia de entrada inicial al decoder
    let stopCondition = false;
    let response = [];

    while (!stopCondition) {
      // Asegúrate de que los inputs sean tensores
      const targetSeqTensor = tf.tensor2d([[startToken]]);
      const stateHTensor = stateH;
      const stateCTensor = stateC;


      // Predicción del decoder
      const [outputTokens, updatedH, updatedC] = decoderModel.predict([
        targetSeqTensor, // Entrada del token actual
        stateHTensor,    // Estado H actual
        stateCTensor     // Estado C actual
      ]);

      // Sample a token from the output distribution
      const sample_token_index = outputTokens.argMax(-1).dataSync()[0];

      // Obtén el índice del token predicho
      const predictedIndex = outputTokens.argMax(-1).dataSync()[0];
      const predictedWord = sequenceToText([sample_token_index], tokenizerTarget);
      let sampled_token = ''


      if (sample_token_index == 0) {
        sample_token_index = '.'
      } else {
        sampled_token = tokenizerTarget[sample_token_index];
      }

      // Añade la palabra a la respuesta
      response.push(predictedWord);

      // Verifica la condición de parada
      if (predictedIndex === endToken || response.length >= maxSeqLength) {
        stopCondition = true;
      }

      // Actualiza el token de entrada y los estados
      targetSeq = tf.tensor2d([[predictedIndex]]);
      stateH = updatedH;
      stateC = updatedC;
    }

    setPrediction(response.join(" "));
    console.log("Respuesta generada:", response.join(" "));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Modelo Encoder-Decoder con TensorFlow.js</h1>

      <div>
        <label>Escribe tu texto de entrada:</label>
        <input
          type="text"
          value={inputSequence}
          onChange={(e) => setInputSequence(e.target.value)}
          placeholder="Escribe algo aquí..."
          style={{ width: "100%", margin: "10px 0", padding: "10px" }}
        />
        <button onClick={generateResponse} style={{ padding: "10px", cursor: "pointer" }}>
          Generar Respuesta
        </button>
      </div>

      {prediction && (
        <div>
          <h2>Respuesta:</h2>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
