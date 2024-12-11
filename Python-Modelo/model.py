import numpy as np  # Álgebra lineal
import pandas as pd  # Procesamiento de datos y manipulación de CSV
import os
import warnings
import re  # Expresiones regulares
from tensorflow.keras.preprocessing.text import Tokenizer  # Tokenizador de texto
from tensorflow.keras.preprocessing.sequence import pad_sequences  # Secuencias con padding
from sklearn.model_selection import train_test_split  # División de datos en entrenamiento y prueba
from tensorflow.keras.layers import Input, LSTM, Dense, Embedding  # Capas del modelo
from tensorflow.keras.models import Model  # Construcción del modelo
from tensorflow.keras.utils import to_categorical  # Codificación one-hot
import tensorflow as tf
import keras
import json
import pickle

warnings.filterwarnings('ignore')  # Ignorar advertencias

# --------------------- Carga de datos ---------------------
# Cargar el conjunto de datos desde un archivo CSV
df = pd.read_csv('./data_clean/data_clean_complete.csv', sep=',', names=['Question', 'Answer'])

# Verificación de valores nulos en las columnas 'Question' y 'Answer'
null_question = df['Question'].isnull().sum()
null_answer = df['Answer'].isnull().sum()

if null_question > 0:
    print("Existen", null_question, "valores nulos en la columna 'Question'.")
else:
    print("No hay valores nulos en la columna 'Question'.")

if null_answer > 0:
    print("Existen", null_answer, "valores nulos en la columna 'Answer'.")
else:
    print("No hay valores nulos en la columna 'Answer'.")

# Verificación de valores vacíos (espacios en blanco)
whitespace_question = df['Question'].apply(lambda x: x.isspace()).sum()
whitespace_answer = df['Answer'].apply(lambda x: x.isspace()).sum()

if whitespace_question > 0:
    print("Existen", whitespace_question, "valores vacíos en la columna 'Question'.")
else:
    print("No hay valores vacíos en la columna 'Question'.")

if whitespace_answer > 0:
    print("Existen", whitespace_answer, "valores vacíos en la columna 'Answer'.")
else:
    print("No hay valores vacíos en la columna 'Answer'.")

# -------------------- Limpieza del texto ---------------------------
# Función para limpiar el texto eliminando números, puntuaciones y espacios redundantes
def clean_text(text):
    text = text.lower()  # Convertir texto a minúsculas
    text = re.sub(r'\d+', ' ', text)  # Reemplazar dígitos con un espacio
    text = re.sub(r'([^\w\s])', r' \1 ', text)  # Agregar espacio alrededor de puntuaciones
    text = re.sub(r'\s+', ' ', text)  # Reemplazar múltiples espacios con uno solo
    text = text.strip()  # Eliminar espacios al inicio y final
    return text

# Aplicar la limpieza de texto
df['Encoder Inputs'] = df['Question'].apply(clean_text)
df['Decoder Inputs'] = "<sos> " + df['Answer'].apply(clean_text) + ' <eos>'
df["Decoder Targets"] = df['Answer'].apply(clean_text) + ' <eos>'

# -------------------- Verificación de los datos ------------------------
# Calcular la longitud de las preguntas y respuestas
df['Question Length'] = df['Encoder Inputs'].apply(lambda x: len(x))
df['Answer Length'] = df['Decoder Inputs'].apply(lambda x: len(x))

# -------------------- Creación de tokens ----------------------------
# Parámetros del tokenizador
num_words = 10000  # Número máximo de palabras
max_seq_length = 10  # Longitud máxima de las secuencias

# Inicializar el tokenizador y ajustarlo a las columnas Encoder y Decoder
tokenizer = Tokenizer(num_words=num_words, oov_token='<unk>')
tokenizer.fit_on_texts(df['Encoder Inputs'].tolist() + df['Decoder Inputs'].tolist())

# Guardar los tokenizers
with open('tokenizer_encoder_decoder.pkl', 'wb') as f:
    pickle.dump(tokenizer, f)

tokenizer_input = Tokenizer(filters='!.,?¡¿')  # Para la entrada

# Recuperamos el array
with open('tokenizer_encoder_decoder.pkl', 'rb') as f:
    tokenizer_input = pickle.load(f)

# Guardar los tokenizers como JSON
with open('tokenizer_encoder_decoder.json', 'w') as f:
    json.dump(tokenizer_input.word_index, f)

print("Tokenizers convertidos a JSON correctamente.")

# Convertir el texto en secuencias numéricas
encoder_inputs = tokenizer.texts_to_sequences(df['Encoder Inputs'].tolist())
decoder_inputs = tokenizer.texts_to_sequences(df['Decoder Inputs'].tolist())
decoder_targets = tokenizer.texts_to_sequences(df['Decoder Targets'].tolist())

#Guardamos los array


# Aplicar padding a las secuencias
encoder_inputs = pad_sequences(encoder_inputs, maxlen=max_seq_length, padding='post', truncating='post')
decoder_inputs = pad_sequences(decoder_inputs, maxlen=max_seq_length, padding='post', truncating='post')
decoder_targets = pad_sequences(decoder_targets, maxlen=max_seq_length, padding='post', truncating='post')

# Tamaño del vocabulario
vocab_size = len(tokenizer.word_index)
print('Tamaño del vocabulario: %d' % vocab_size)

# Dividir los datos en entrenamiento y prueba
encoder_inputs_train, encoder_inputs_test, decoder_inputs_train, decoder_inputs_test, decoder_targets_train, decoder_targets_test = train_test_split(
    encoder_inputs, decoder_inputs, decoder_targets, test_size=0.2, random_state=42)

# ------------------- Definir el modelo Seq2Seq ---------------------------
num_encoder_tokens = len(tokenizer.word_index) + 1
latent_dim = 32  # Dimensión de la LSTM
embedding_dim = 50  # Dimensión del embedding

# Definir las entradas del encoder
encoder_inputs = Input(shape=(max_seq_length,))
encoder_embedding = Embedding(num_encoder_tokens, embedding_dim, mask_zero=True)
encoder_inputs_embedded = encoder_embedding(encoder_inputs)

# Capas LSTM en el encoder
encoder_lstm1 = LSTM(latent_dim, return_sequences=True, return_state=True, dropout=0.4, recurrent_dropout=0.4)
encoder_output1, state_h1, state_c1 = encoder_lstm1(encoder_inputs_embedded)

# Segunda capa LSTM
encoder_lstm2 = LSTM(latent_dim, return_sequences=True, return_state=True, dropout=0.4, recurrent_dropout=0.4)
encoder_output2, state_h2, state_c2 = encoder_lstm2(encoder_output1)

# Última capa LSTM
encoder_lstm3 = LSTM(latent_dim, return_state=True, return_sequences=True, dropout=0.4, recurrent_dropout=0.4)
encoder_outputs, state_h, state_c = encoder_lstm3(encoder_output2)

# Guardar los estados finales
encoder_states = [state_h, state_c]

# ------------------- Decoder ---------------------------
decoder_inputs = Input(shape=(max_seq_length,))
decoder_embedding = Embedding(num_encoder_tokens, embedding_dim, mask_zero=True)
decoder_inputs_embedded = decoder_embedding(decoder_inputs)

# LSTM del decoder
decoder_lstm = LSTM(latent_dim, return_sequences=True, return_state=True)
decoder_outputs, _, _ = decoder_lstm(decoder_inputs_embedded, initial_state=encoder_states)

# Capa densa con activación softmax
decoder_dense = Dense(num_encoder_tokens, activation='softmax')
decoder_outputs = decoder_dense(decoder_outputs)

# Construir el modelo completo
model = Model([encoder_inputs, decoder_inputs], decoder_outputs)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Entrenamiento del modelo
early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3)
batch_size = 32
epochs = 30

# Codificar objetivos a formato one-hot
decoder_targets_train = to_categorical(decoder_targets_train, num_encoder_tokens)
decoder_targets_test = to_categorical(decoder_targets_test, num_encoder_tokens)

model.fit([encoder_inputs_train, decoder_inputs_train], decoder_targets_train,
          validation_data=([encoder_inputs_test, decoder_inputs_test], decoder_targets_test),
          batch_size=batch_size, epochs=epochs, callbacks=[early_stopping])

# Guardar el modelo entrenado
model.save("seq2seq_chatbot.keras")
model.save("seq2seq_chatbot.h5")
tf.saved_model.save(model, './')
print("Modelo guardado como seq2seq_chatbot.keras")

# Convertirlo con tensorflow (keras)
# tensorflowjs_converter --input_format=keras seq2seq_chatbot.keras ./modelo_tfjs

# Convertirlo con tensorflow (h5)
# tensorflowjs_converter --input_format=keras seq2seq_chatbot.h5 ./modelo_tfjs


# ************************ Probar el modelo ************************
# ----------------------- Modelo del codificador (Encoder) -------------------------
# Define un modelo del codificador que devuelve los estados finales (h y c) de la LSTM.
encoder_model = Model(encoder_inputs, encoder_states)

# ----------------------- Modelo del decodificador (Decoder) -------------------------
# Define las entradas de los estados ocultos (h y c) del decodificador.
decoder_state_input_h = Input(shape=(latent_dim,))
decoder_state_input_c = Input(shape=(latent_dim,))
decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]

# Define la entrada del decodificador para una única palabra (una secuencia de longitud 1).
decoder_inputs_single = Input(shape=(1,))

# Embebe la entrada del decodificador (convertir tokens a vectores densos).
decoder_inputs_single_embedded = decoder_embedding(decoder_inputs_single)

# Pasa la entrada embebida y los estados iniciales a la LSTM del decodificador.
decoder_outputs, state_h, state_c = decoder_lstm(decoder_inputs_single_embedded, initial_state=decoder_states_inputs)

# Actualiza los estados del decodificador.
decoder_states = [state_h, state_c]

# Aplica una capa densa (softmax) para predecir la siguiente palabra en la secuencia.
decoder_outputs = decoder_dense(decoder_outputs)

# Define el modelo del decodificador, que toma la entrada de una palabra y los estados anteriores,
# y devuelve la predicción de la siguiente palabra junto con los nuevos estados.
decoder_model = Model([decoder_inputs_single] + decoder_states_inputs, [decoder_outputs] + decoder_states)

# ----------------------- Función para generar una respuesta -------------------------
def generate_response(input_seq):
    """
    Genera una respuesta secuencia a secuencia dada una secuencia de entrada.

    Parámetros:
        input_seq: Secuencia de entrada codificada.

    Retorna:
        Una cadena de texto que representa la respuesta generada.
    """
    # Codifica la secuencia de entrada para obtener los estados iniciales del decodificador.
    states_value = encoder_model.predict(input_seq)

    # Inicializa la secuencia objetivo con el token de inicio <sos>.
    target_seq = np.array([[tokenizer.word_index['sos']]])

    # Condición de parada para la generación de la respuesta.
    stop_condition = False
    response = []

    # Bucle para predecir la siguiente palabra hasta que se cumpla la condición de parada.
    while not stop_condition:
        # Predice la siguiente palabra y los estados ocultos actualizados.
        output_tokens, h, c = decoder_model.predict([target_seq] + states_value)

        # Selecciona la palabra con la probabilidad más alta (argmax).
        sampled_token_index = np.argmax(output_tokens[0, -1, :])
        
        # Si el índice de la palabra predicha es 0 (token desconocido), usa un punto como predicción.
        if sampled_token_index == 0:
            sampled_token = '.'
        else:
            # Recupera la palabra correspondiente al índice predicho.
            sampled_token = tokenizer.index_word[sampled_token_index]
        
        # Añade la palabra predicha a la respuesta.
        response.append(sampled_token)

        # Condición de parada: alcanza el token de finalización <eos> o supera la longitud máxima.
        if sampled_token == 'eos' or len(response) > max_seq_length:
            stop_condition = True

        # Actualiza la secuencia objetivo con la palabra predicha.
        target_seq = np.array([[sampled_token_index]])

        # Actualiza los estados ocultos del decodificador.
        states_value = [h, c]

    # Retorna la respuesta como una cadena de texto unida por espacios.
    return ' '.join(response)

# ----------------------- Prueba del modelo -------------------------
# Prepara una secuencia de entrada para prueba (por ejemplo, "hello").
input_sequence = tokenizer.texts_to_sequences(["hello"])
input_sequence = pad_sequences(input_sequence, maxlen=max_seq_length, padding='post', truncating='post')

# Genera una respuesta utilizando la función `generate_response`.
response = generate_response(input_sequence)

# Imprime la secuencia de entrada y la respuesta generada.
print("Input:", f'{input_sequence}')
print("Response:", response)

# Guardar los modelos
encoder_model.save("encoder_model.h5")
decoder_model.save("decoder_model.h5")

# Generar el javascript
# tensorflowjs_converter --input_format keras encoder_model.h5 encoder_model/
# tensorflowjs_converter --input_format keras decoder_model.h5 decoder_model/