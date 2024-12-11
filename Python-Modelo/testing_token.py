import pickle
import os

# Cargar los tokenizers guardados
with open('tokenizer_input.pkl', 'rb') as f:
    tokenizer_input = pickle.load(f)

with open('tokenizer_target.pkl', 'rb') as f:
    tokenizer_target = pickle.load(f)

# Verificar el diccionario de tokens para input (entrada)
print("Diccionario de tokens para input:")
print(tokenizer_input.word_index)

# Verificar el diccionario de tokens para target (salida)
print("\nDiccionario de tokens para target:")
print(tokenizer_target.word_index)

# Verificar la conversión de una frase de entrada a tokens
sample_input = "What's up?"
input_tokens = tokenizer_input.texts_to_sequences([sample_input])
print(f"\nFrase de entrada: {sample_input}")
print(f"Tokens de entrada: {input_tokens}")

# Verificar la conversión de una frase de salida a tokens (target)
sample_target = "¡¿Qué pasa?!"
target_tokens = tokenizer_target.texts_to_sequences([sample_target])
print(f"\nFrase de salida: {sample_target}")
print(f"Tokens de salida: {target_tokens}")
