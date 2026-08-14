# API HTTP de Videojuegos (TypeScript)

API REST ligera construida nativamente con Node.js y TypeScript para la gestión de un catálogo en memoria de videojuegos.

## 🚀 Requisitos e Instalación

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

El servidor se iniciará en `http://localhost:3000`.

## 📌 Rutas de la API

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/health` | Estado del servidor y conteo de registros |
| **GET** | `/api/juegos` | Listar videojuegos (soporta filtros `?desarrollador=` y `?disponible=`) |
| **GET** | `/api/juegos/:id` | Obtener videojuego por su ID |
| **POST** | `/api/juegos` | Registrar un nuevo videojuego |
| **PATCH** | `/api/juegos/:id` | Actualizar parcialmente un videojuego |
| **DELETE** | `/api/juegos/:id` | Eliminar un videojuego |