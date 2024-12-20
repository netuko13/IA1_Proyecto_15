import pandas as pd
from tensorflow.keras.preprocessing.text import Tokenizer
import pickle
import json

# Cargar el archivo CSV limpio
data = pd.read_csv('data_clean/data_clean.csv', sep=',', header=None, names=['input', 'target'])

# Verificar que los datos se cargaron correctamente
print("Primeras filas de los datos:")
print(data.head())

# Eliminar filas con valores nulos en 'input' o 'target'
data.dropna(subset=['input', 'target'], inplace=True)

# Convertir las columnas a tipo string
data['input'] = data['input'].astype(str)
data['target'] = data['target'].astype(str)

# Agregar tokens de inicio (<start>) y fin (<end>) a las frases objetivo
data['target'] = data['target'].apply(lambda x: 'sos ' + x + ' eos')

# Verificar que los tokens se agregaron correctamente
print("\nDatos después de agregar tokens <sos> y <eos>:")
print(data.head())

# ---------- Tokenizers para Entrada y Salida ----------
# Eliminar puntos, signos de exclamación y signos de interrogación
tokenizer_input = Tokenizer(filters='!.,?¡¿')  # Para la entrada
tokenizer_input.fit_on_texts(data['input'])

tokenizer_target = Tokenizer(filters='!.,?¡¿')  # Para la salida
tokenizer_target.fit_on_texts(data['target'])

# Guardar los tokenizers
with open('tokenizer_input.pkl', 'wb') as f:
    pickle.dump(tokenizer_input, f)

with open('tokenizer_target.pkl', 'wb') as f:
    pickle.dump(tokenizer_target, f)

print("\nTokenizers reconstruidos y guardados como 'tokenizer_input.pkl' y 'tokenizer_target.pkl'")

# Verificar los índices de los tokens especiales
print(f"Índice del token <sos>: {tokenizer_target.word_index.get('<sos>')}")
print(f"Índice del token <eos>: {tokenizer_target.word_index.get('<eos>')}")

# Ejemplo de secuencia tokenizada
example_input = data['input'].iloc[0]
example_target = data['target'].iloc[0]

input_seq = tokenizer_input.texts_to_sequences([example_input])
target_seq = tokenizer_target.texts_to_sequences([example_target])

print("\nEjemplo de frase tokenizada:")
print(f"Frase de entrada original: {example_input}")
print(f"Tokens de entrada: {input_seq}")
print(f"Frase objetivo original: {example_target}")
print(f"Tokens de salida: {target_seq}")

# ------------- Hacer la conversion a JSON ---------------------
# Cargar los tokenizers desde los archivos pickle
with open('tokenizer_input.pkl', 'rb') as f:
    tokenizer_input = pickle.load(f)

with open('tokenizer_target.pkl', 'rb') as f:
    tokenizer_target = pickle.load(f)

# Guardar los tokenizers como JSON
with open('tokenizer_input.json', 'w') as f:
    json.dump(tokenizer_input.word_index, f)

with open('tokenizer_target.json', 'w') as f:
    json.dump(tokenizer_target.word_index, f)

print("Tokenizers convertidos a JSON correctamente.")