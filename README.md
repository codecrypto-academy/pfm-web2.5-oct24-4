# PFM Web 2.5 - Grupo 4  

## Objetivo del proyecto  
El propósito general del sistema es construir una red privada de Ethereum y proporcionar herramientas de gestión como un faucet compatible Metamask.  

## Arquitectura del Sistema  
Para cumplir con los objetivos, se requiere una arquitectura dividida en varios componentes: 
1. __Front-end:__ Una interfaz de usuario que permita visualizar datos relevantes (como bloques y transacciones) y que brinde herramientas para que los usuarios interactúen con la red de blockchain. Esta interfaz debe incluir opciones para crear, modificar y eliminar redes y nodos.  
2. __Back-end:__ Un servidor que maneje las solicitudes de la interfaz, realizando llamadas necesarias para obtener y procesar los datos de la blockchain, y respondiendo a los comandos de la interfaz de usuario. Actuará como intermediario entre el front-end y los nodos de la blockchain.  
3. __Blockchain privada y nodos:__ Una red de blockchain privada para gestionar las transacciones. Esto incluye la implementación de nodos que permitan simular una red distribuida.  
4. __Red de simulación de nodos:__ Una configuración de red que distribuya los nodos en diferentes máquinas o entornos virtualizados, permitiendo la comunicación entre ellos.  

## Selección de Tecnologías  
* __Back-end:__  Se eligió __Node.js__ con __Express__ para crear una API REST que facilite la comunicación entre el front-end y los nodos de la blockchain. __Node.js__ tiene buena compatibilidad con herramientas de blockchain, como web3.js o ethers.js, que serán útiles para interactuar con la red Ethereum.
* __Front-end:__ Se usará __React__, un framework que permite crear interfaces dinámicas y reutilizables, facilitando la visualización de datos (por ejemplo, listas de transacciones y bloques) y la creación de formularios de interacción para el usuario.
* __Base de datos:__ Se desplegará __MySql__ (o una base de datos relacional similar) para almacenar configuraciones, estados de las redes y detalles de usuarios. La blockchain gestionará los datos transaccionales de forma descentralizada, pero la base de datos permitirá administrar los metadatos relacionados con la gestión de redes y nodos.
* __Blockchain privada:__ En este caso, __Geth (Go-Ethereum)__ se usará para construir y gestionar la red de Ethereum privada, proporcionando la infraestructura base para la creación de bloques y el manejo de transacciones. Docker se empleará para contenerizar y aislar cada nodo de la red, facilitando su despliegue y configuración en un entorno controlado. 
