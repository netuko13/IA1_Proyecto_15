import pandas as pd
import os

# Función para limpiar y procesar los datos
def clean_data(input_file, output_folder, output_file):
    # Crear la carpeta si no existe
    os.makedirs(output_folder, exist_ok=True)
    
    # Leer el archivo CSV original
    print("Leyendo datos...")
    df = pd.read_csv(input_file, sep="\t", header=None, usecols=[0, 1], names=["input", "output"])
    
    # Guardar únicamente las columnas necesarias
    print("Guardando datos limpios...")
    output_path = os.path.join(output_folder, output_file)
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"Datos guardados correctamente en: {output_path}")

# Archivo de entrada y salida
input_file = "./data/spa.txt" 
output_folder = "data_clean"         
output_file = "data_clean_complete.csv"       

# Ejecutar limpieza
clean_data(input_file, output_folder, output_file)
