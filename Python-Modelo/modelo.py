import tensorflow as tf
from tensorflow.keras.layers import Embedding, LSTM, Dense
from tensorflow.keras.models import Model
import numpy as np
import pandas as pd

# Cargar el archivo de la informacion.
df = pd.read_csv('./data/spa.csv', sep='\t', header=None, usecols=[0, 1], names=['input', 'target'])

# Preprocesar los textos para convertir a minusculas y estar estandarizado.
def preprocess_text(text):
    text = text.lower().strip()
    text = f"<start> {text} <end>"
    return text

df['input'] = df['input'].apply(preprocess_text)
df['target'] = df['target'].apply(preprocess_text)

# Crear vocabularios para las letras que enviaremos al modelo.
input_texts = df['input'].values
target_texts = df['target'].values

input_vocab = sorted(set(' '.join(input_texts)))
target_vocab = sorted(set(' '.join(target_texts)))

input_tokenizer = {char: i for i, char in enumerate(input_vocab)}
target_tokenizer = {char: i for i, char in enumerate(target_vocab)}

# Tokenización y asignarle un token a cada una de las palabras.
max_encoder_len = max([len(txt) for txt in input_texts])
max_decoder_len = max([len(txt) for txt in target_texts])

def tokenize(text, tokenizer, max_len):
    tokens = [tokenizer[char] for char in text]
    return tf.keras.utils.pad_sequences([tokens], maxlen=max_len, padding='post')[0]

input_sequences = np.array([tokenize(txt, input_tokenizer, max_encoder_len) for txt in input_texts])
target_sequences = np.array([tokenize(txt, target_tokenizer, max_decoder_len) for txt in target_texts])

# Datos para entrenamiento.
encoder_input_data = input_sequences
decoder_input_data = target_sequences[:, :-1]
decoder_target_data = target_sequences[:, 1:]

# Modelo Seq2Seq.
embedding_dim = 256
latent_dim = 512

# Definimos el Encoder.
encoder_inputs = tf.keras.Input(shape=(max_encoder_len,))
x = Embedding(len(input_vocab), embedding_dim)(encoder_inputs)
encoder_outputs, state_h, state_c = LSTM(latent_dim, return_state=True)(x)
encoder_states = [state_h, state_c]

# Definimos el Decoder.
decoder_inputs = tf.keras.Input(shape=(max_decoder_len-1,))
x = Embedding(len(target_vocab), embedding_dim)(decoder_inputs)
x = LSTM(latent_dim, return_sequences=True, return_state=False)(x, initial_state=encoder_states)
decoder_outputs = Dense(len(target_vocab), activation='softmax')(x)

# Cargamos la informacion al modelo.
model = Model([encoder_inputs, decoder_inputs], decoder_outputs)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
model.summary()

# Empezamos el entrenamiento.
model.fit([encoder_input_data, decoder_input_data], decoder_target_data, epochs=10, batch_size=64)

# Se guardar el modelo para ya utilizarlo con javascript.
model.save('seq2seq_model')
