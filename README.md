# 🎮 Ingame14 - Stream Dashboard

¡Bienvenido al centro de control de **Ingame14**! Esta es una aplicación web dinámica diseñada para conectar a la comunidad con los directos y contenidos más recientes, automatizando la detección de transmisiones en vivo.

Diseñado bajo la filosofía de **Dodo**: Eficiencia, elegancia y código limpio.

---

## 🚀 ¿Qué hace este proyecto?

El sistema decide inteligentemente qué mostrar al usuario siguiendo esta jerarquía:
1. **YouTube Live:** Si el canal está transmitiendo, es la prioridad #1.
2. **Twitch Live:** Si no hay YouTube pero sí Twitch, cambia el reproductor automáticamente.
3. **Modo Offline:** Si no hay directos, busca y muestra el último video/stream finalizado de YouTube (o Twitch como respaldo).

---

## 🛠️ Tecnologías utilizadas

* **Frontend:** HTML5, CSS3 (Diseño responsivo) y JavaScript Asíncrono (Fetch API).
* **Backend:** PHP 8.x (Actuando como puente seguro para APIs).
* **APIs:** YouTube Data API v3 & Twitch API (Helix).
* **Hosting:** Implementado en **Railway** con flujo de trabajo de **GitHub**.

---

## ⚙️ Configuración (Variables de Entorno)

Para que el proyecto funcione, necesitas configurar las siguientes llaves en tu servidor (Railway):

| Variable | Descripción |
| :--- | :--- |
| `YT_API_KEY` | Tu llave secreta de Google Cloud Console. |
| `YT_CHANNEL_ID` | El ID de tu canal de YouTube. |
| `TWITCH_CLIENT_ID` | ID de aplicación de Twitch Developers. |
| `TWITCH_CLIENT_SECRET` | Llave secreta de tu app de Twitch. |

---

## 📁 Estructura del Proyecto

* `index.html`: La interfaz visual y el contenedor de los reproductores.
* `script.js`: El "cerebro" que decide qué plataforma mostrar usando `async/await`.
* `api/index.php`: El "guardaespaldas" que procesa las peticiones y protege las API Keys.
* `style.css`: Estilos personalizados y animaciones.

---

## 🛡️ Verificación
Este sitio ha sido verificado en **Google Search Console** mediante el método de archivo HTML para optimizar el SEO y aparecer en los resultados de búsqueda.

---
Hecho con ❤️ por [Tu Nombre/Dodo Digital]
