# 📖 Documentación Técnica y Arquitectura: Valkyr App

## 1. Visión General y Propósito
Valkyr es una plataforma integral enfocada en la gestión personalizada de rutinas de entrenamiento físico. Busca ofrecer la fluidez de una aplicación nativa desde el navegador. El sistema se apoya en una arquitectura cliente-servidor desacoplada, garantizando alta disponibilidad, seguridad mediante tokens y un despliegue en el borde (Edge) para minimizar la latencia.



---

## 2. Stack Tecnológico (Tech Stack)

### 🖥️ Capa de Presentación (Frontend)
* **Core:** React.js (v18+) con Functional Components y Hooks.
* **UI/UX Framework:** Ionic Framework (`@ionic/react`). Encargado del renderizado adaptativo de componentes (iOS/Material Design) y la gestión de transiciones de página.
* **Tipado:** TypeScript. Añade seguridad en tiempo de compilación y facilita el mantenimiento de las interfaces de datos.
* **Routing:** React Router DOM integrado con `IonReactRouter`. Manejo del historial de navegación y protección de rutas en el lado del cliente.
* **Bundler & Build Tool:** Vite. Sustituye a Webpack, optimizando el "Hot Module Replacement" (HMR) y generando *chunks* de código eficientes (ES modules) para producción.

### ⚙️ Capa de Lógica de Negocio (Backend)
* **Framework:** Spring Boot (Ecosistema Java). Proporciona un contenedor de servlets embebido (Tomcat) y configuración automática.
* **Arquitectura:** API RESTful orientada a microservicios (Controlador -> Servicio -> Repositorio).
* **Seguridad (Auth):** Implementación de seguridad Stateless mediante Tokens (JWT/Bearer Token).

### 🗄️ Capa de Persistencia (Base de Datos)
* **Motor:** MySQL (Relacional).
* **Virtualización:** Docker (`mysql-valkyr`). Garantiza la paridad entre los entornos de desarrollo, pruebas y producción mediante contenedores aislados.

---

## 3. Topología de Red y Estrategia de Despliegue (DevOps)

La infraestructura de Valkyr prescinde de servidores web tradicionales expuestos a internet, utilizando en su lugar la red global de Cloudflare para seguridad y distribución.

* **Frontend Hosting (Cloudflare Pages):** El código compilado (`dist`) se distribuye a través de la CDN de Cloudflare (`www.valkyrapp.com`). Se ha implementado una regla de reescritura (`_redirects: /* / 200`) para delegar el enrutamiento al cliente (React) y evitar errores `404` o conflictos MIME type en la carga de módulos JS/CSS.
* **Backend Exposición (Cloudflare Zero Trust Tunnels):** La API de Spring Boot (`api.valkyrapp.com`) no tiene puertos públicos abiertos. Se conecta a la red de Cloudflare desde el interior del servidor mediante el demonio `cloudflared`.
* **Decisión Técnica Crítica (Protocolo de Túnel):** Para sortear las restricciones de cortafuegos en redes corporativas o públicas que bloquean tráfico UDP (afectando al protocolo por defecto QUIC), el túnel está forzado a operar sobre **TCP (HTTP/2)**. Esto asegura un 100% de fiabilidad en la entrega de paquetes entre el cliente y el servidor Java.
* **Seguridad Perimetral:** Encriptación SSL/TLS (Full Strict), ofuscación de la IP real del servidor de base de datos y mitigación DDoS.

---

## 4. Análisis de Flujos Críticos

### 4.1. Flujo de Autenticación y Guardias de Ruta
1. El usuario envía credenciales a través del componente `<Login />`.
2. El servidor valida contra MySQL y devuelve un Token de acceso.
3. El frontend intercepta la respuesta, extrae el token (ya sea del cuerpo o la cabecera `Authorization`) y lo persiste en el `localStorage`.
4. El archivo principal `App.tsx` actúa como **Route Guard**:
   * Intercepta accesos a `/tabs/*`. Si no existe token, redirige a `/login`.
   * Intercepta accesos a la raíz `/`. Si existe token, redirige a la vista principal de rutinas, impidiendo bucles de redirección infinitos.

### 4.2. Flujo de Renderizado de Rutinas
1. Al acceder a `<MainTabs />`, se disparan llamadas asíncronas mediante `axios` o `fetch` hacia los endpoints protegidos de la API.
2. El estado local de React se actualiza con la respuesta, provocando un re-renderizado del Virtual DOM.
3. Los componentes como checkboxes aplican renderizado condicional: si un ejercicio está completado, se inyecta dinámicamente la clase CSS `.is-done` para alterar la opacidad y tachar el texto (Feedback visual inmediato).

---

## 5. Diseño de API (Endpoints Principales)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Autentica al usuario y devuelve el Token. | ❌ |
| `POST` | `/api/auth/register` | Crea un nuevo usuario en la base de datos. | ❌ |
| `GET` | `/api/routines` | Obtiene el listado de rutinas del usuario logueado. | ✅ |
| `POST` | `/api/routines` | Persiste una nueva rutina con sus ejercicios. | ✅ |
| `PUT` | `/api/routines/{id}` | Actualiza el estado (completado/pendiente) de un ejercicio. | ✅ |

---

## 6. Configuración y Entorno de Desarrollo Local

Para levantar el ecosistema Valkyr en un entorno de desarrollo local, seguir los siguientes pasos:

### Prerrequisitos
* Node.js (v18+) y NPM.
* Java Development Kit (JDK) 17+.
* Docker Desktop.
* Git.

### Pasos de Ejecución
1. **Clonar repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/valkyr-app.git](https://github.com/tu-usuario/valkyr-app.git)
   cd valkyr-app

2. **Iniciar el contenedor Docker de MySQL:**
   ```bash
    docker start mysql-valkyr
   
3. **Arrancar Backend (Spring Boot):**
   1. Accedemos a la parte backend de la aplicacion mediante un IDE o mediante Maven
   2. Iniciamos la clase principal `ApiApplication.java`
   3. Ya estaria arrancada la parte del servidor escuchando el puerto 8080

4. **Arrancar Frontend (Vite/Ionic):**
   ```bash
    npm install
    # Las variables de entorno en desarrollo apuntarán automáticamente a localhost
    npm run dev

5. **Acceder a http://localhost:8100**
