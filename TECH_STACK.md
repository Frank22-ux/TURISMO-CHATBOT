# Documentación del Stack Tecnológico - ISTPET Turismo

Este documento detalla todas las tecnologías, frameworks y principios de diseño utilizados en el desarrollo de la plataforma **ISTPET Turismo**.

## 1. Frontend (Capas de Presentación e Interacción)

La interfaz de usuario ha sido construida siguiendo un enfoque de **Vanilla Development** para maximizar el rendimiento y permitir un control total sobre el diseño "Premium".

- **Lenguajes Base**: 
  - **HTML5**: Estructura semántica para SEO y accesibilidad.
  - **JavaScript (ES6+)**: Lógica funcional sin dependencias pesadas.
- **Estilo y Diseño**:
  - **CSS3 (Custom Design System)**: Sistema de diseño propio basado en variables CSS (`:root`) para consistencia global.
  - **Glassmorphism**: Uso extendido de `backdrop-filter: blur()` y transparencias para un look moderno.
  - **Animaciones Ken Burns**: Efectos cinemáticos en fondos de pantalla (zoom suave y paneo).
- **Tipografía y Gráficos**:
  - **Google Fonts**: Uso de las familias 'Poppins' y 'Montserrat'.
  - **Font Awesome 6**: Biblioteca principal para iconografía profesional.
  - **SVG**: Gráficos vectoriales escalables para logos e ilustraciones.
- **Librerías de Terceros**:
  - **Intl-Tel-Input**: Manejo profesional de números telefónicos internacionales y validación de países.

## 2. Backend (Servidor y Lógica de Negocio)

El motor del sistema se basa en un ecosistema robusto de JavaScript en el servidor.

- **Entorno de Ejecución**: **Node.js**
- **Framework de Servidor**: **Express.js (v5)**
- **Seguridad y Autenticación**:
  - **JSON Web Tokens (JWT)**: Para el manejo de sesiones seguras y stateless.
  - **Bcryptjs**: Encriptación avanzada de contraseñas (Hashing).
- **Middleware**:
  - **CORS**: Gestión de acceso cruzado entre frontend y backend.
  - **Morgan**: Registro (logging) de solicitudes HTTP para auditoría.
  - **Dotenv**: Gestión segura de variables de entorno.

## 3. Base de Datos (Persistencia)

- **Motor de Base de Datos**: **PostgreSQL**
- **Cliente / Driver**: `pg` (Pool de conexiones para alta concurrencia).
- **Esquema**: Relacional, con manejo de roles (TURISTA, ANFITRION, ADMIN).

## 4. Filosofía de Diseño "Premium"

El proyecto se diferencia por seguir principios estéticos de alta gama:
- **Colores Naturaleza**: Paleta basada en tonos tierra, mar y vegetación (Sienna, Teal, Sand).
- **Micro-interacciones**: Transiciones suaves y hover effects que responden al usuario.
- **Diseño Responsivo**: Adaptación total a móviles, tablets y escritorios.
- **UI/UX Intuitiva**: Formularios con validación en tiempo real y feedback visual inmediato.

---
*Desarrollado con pasión para ISTPET Turismo.*
