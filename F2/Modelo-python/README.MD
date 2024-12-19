# Pasos para que funcione el modelo y la conversion posterior

## Version de python utilizada
```sh
3.10.12
```
## Version de pip utilizada
```sh
pip 22.0.2
```
## Instalar primero virtualenv para crear un enviroment virtual
```sh
pip install virtualenv
```
## Creamos un entorno virtualenv
```sh
python3 -m venv env
```
## Activar el entorno virtual
```sh
source env/bin/activate
```
## Comando para instalar paquetes personalizados
```sh
env/bin/pip install <nombre_del_paquete>
```
## RAW versiones paquetes
```sh
numpy 1.26.4
tensorflow 2.15.0
tensorflow-decision-forests 1.8.1
pyyaml 6.0.2
kagglehub 0.3.5
gensim 4.3.3
```
## Paquetes necesarios instalacion manual
```sh
env/bin/pip install numpy==1.26.4
env/bin/pip install tensorflow==2.15.0
env/bin/pip install tensorflow-decision-forests==1.8.1
env/bin/pip install pyyaml==6.0.2
env/bin/pip install kagglehub==0.3.5
env/bin/pip install gensim==4.3.3
```
## Resumen tensorflowjs_converter --version
```sh
tensorflowjs_converter --version
2024-12-19 13:58:40.207322: E external/local_xla/xla/stream_executor/cuda/cuda_dnn.cc:9261] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
2024-12-19 13:58:40.207376: E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:607] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
2024-12-19 13:58:40.210218: E external/local_xla/xla/stream_executor/cuda/cuda_blas.cc:1515] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
2024-12-19 13:58:40.220699: I tensorflow/core/platform/cpu_feature_guard.cc:182] This TensorFlow binary is optimized to use available CPU instructions in performance-critical operations.
To enable the following instructions: AVX2 FMA, in other operations, rebuild TensorFlow with the appropriate compiler flags.
2024-12-19 13:58:41.563146: W tensorflow/compiler/tf2tensorrt/utils/py_utils.cc:38] TF-TRT Warning: Could not find TensorRT

tensorflowjs 4.22.0

Dependency versions:
  keras 2.18.0
  tensorflow 2.15.0
```
## Convertir el modelo
```sh
tensorflowjs_converter --input_format keras model.h5 encoder_model/
```






