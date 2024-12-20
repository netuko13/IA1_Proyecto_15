import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';


function Testing() {
  const [model, setModel] = useState(null);
  const [inputText, setInputText] = useState(''); // Texto de entrada
  const [outputText, setOutputText] = useState(''); // Resultado del modelo
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [tokenizerData, setTokenizerData] = useState({});

  // Cargar el modelo cuando el componente se monta

  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json');
      console.log('Modelo cargado correctamente');
      loadedModel.summary();
      setModel(loadedModel);
    } catch (error) {
      console.error('Error al cargar el modelo:', error);
    }
  };

  const loadTokenizers = async () => {
    try {
      const inputRes = await fetch("/tfjs_model/tokenizer_encoder_decoder.json");
      const targetTokenizer = await inputRes.json();

      setTokenizerData(targetTokenizer);
      console.log("Tokenizers cargados.");
    } catch (error) {
      console.error("Error al cargar los tokenizers:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    
    loadTokenizers();
    loadModel();
  }, []);

  // Codificar la entrada de texto en índices
 // Codificar la entrada de texto en índices
 const encodeInput = (text) => {
    const unknownToken = tokenizerData.unk || 0; // Asegura que <unk> esté configurado
    const inputTokens = text.split(' ').map((word) => {
      const token = tokenizerData[word.toLowerCase()];
      return token !== undefined ? token : unknownToken; // Usar <unk> o 0 si la palabra no se encuentra
    });

    // Asegurarse de que la secuencia tenga longitud 22
    const targetLength = 22; // Cambiar el tamaño esperado
    const paddedInput = [...inputTokens];

    // Si la longitud es menor a 22, agregar ceros
    while (paddedInput.length < targetLength) {
      paddedInput.push(0); // O usar un token de padding si se tiene uno definido
    }

    // Si la longitud es mayor a 22, cortar la secuencia
    return paddedInput.slice(0, targetLength);
  };

  // Decodificar los índices en texto
  const decodeOutput = (output) => {
    const reverseWordIndex = Object.keys(tokenizerData);
    return output
      .map((index) => reverseWordIndex[index] || '<unk>')
      .join(' ');
  };

  // Predecir la secuencia palabra por palabra en un ciclo while
  const runSeq2Seq = async () => {
    if (!model) return;
  
    try {
      const encodedInput = encodeInput(inputText); // Codificar el texto de entrada
      let inputTensor = tf.tensor([encodedInput]);
  
      // Inicializar la secuencia de salida con el token <start>
      const startToken = tokenizerData.start || 2;
      let outputSequence = [startToken];
      let stopPrediction = false;
  
      // Crear el tensor de estado para input_10, que se espera de tamaño [1, 74]
      const stateTensor = tf.zeros([1, 74]); // Ajustamos el tamaño para que sea 74
  
      // Ciclo while para predecir palabra por palabra
      while (!stopPrediction) {
        // Aquí vamos a pasar los dos tensores: inputTensor y stateTensor
        const result = model.predict([inputTensor, stateTensor]);
  
        // Imprimir la salida del modelo para depuración
        console.log('Model prediction result:', result.shape);
  
        // Verificar si result tiene la estructura esperada
        if (!result || result.length < 2) {
          console.error('Unexpected model output structure', result);
          break;
        }
  
        // Obtener la predicción de la primera salida (salida de la capa densa)
        const predictedSequence = result.shape;
        const nextState = result.shape; // El nuevo estado (si está disponible)
  
        console.log()
        // Verificar que predictedSequence es un tensor válido
        if (!predictedSequence || predictedSequence.length === 0) {
          console.error('Invalid predicted sequence:', predictedSequence);
          break;
        }
  
        // Acceder a los valores del tensor de forma segura
        // Tomamos la última palabra de la secuencia (posición 73)
        const lastWord = predictedSequence.arraySync()[0][73];
  
        // Obtener el índice de la palabra con la mayor probabilidad
        const predictedIndex = lastWord.indexOf(Math.max(...lastWord)); // El índice con la probabilidad más alta
  
        if (predictedIndex === -1) {
          console.error('Failed to get predicted index');
          break;
        }
  
        console.log('Predicted index:', predictedIndex);
  
        // Decodificar el índice predicho
        outputSequence.push(predictedIndex);
  
        // Si el modelo predice el token <end>, se detiene la predicción
        if (predictedIndex === tokenizerData.end) {
          stopPrediction = true;
        }
  
        // La próxima entrada es el índice de la palabra predicha
        inputTensor = tf.tensor([outputSequence]);
  
        // Actualizamos el estado con el nuevo estado obtenido del modelo
        stateTensor.assign(nextState);
  
        // Limitar la longitud de la secuencia para evitar ciclos infinitos (ajustar según el caso)
        if (outputSequence.length > 50) {
          stopPrediction = true;
        }
      }
  
      // Decodificar la secuencia de salida
      const decodedOutput = decodeOutput(outputSequence);
      setOutputText(decodedOutput); // Establecer la salida en el estado
    } catch (error) {
      console.error('Error executing model:', error);
    }
  };

  return (
    <div>
      <h1>Seq2Seq Model Inference</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your input here"
        rows="5"
        cols="50"
      />
      <br />
      <button onClick={runSeq2Seq}>Run Model</button>
      <div>
        <h3>Output:</h3>
        <p>{outputText}</p>
      </div>
    </div>
  );
};



export default Testing;