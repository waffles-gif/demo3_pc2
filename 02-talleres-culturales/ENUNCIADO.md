# Simulacro 02 · Inscripción a talleres culturales

**Pregunta práctica · 14 puntos**

Implementa una aplicación web para **inscripción a talleres culturales**. Usa React, TypeScript, React Router, Axios y Tailwind. Consume el backend provisto según [API.md](API.md).

## 1. Autenticación y navegación · 3 puntos

- **Registro · 1 punto.** En `/register`, solicita nombre, correo y contraseña. Exige un nombre de hasta 100 caracteres, correo válido y una contraseña de 8 a 72 caracteres ASCII. Después del registro, dirige al login.
- **Inicio de sesión · 1 punto.** En `/login`, solicita correo y contraseña. Incluye un enlace al registro y muestra un mensaje si las credenciales son incorrectas. Guarda el JWT en `localStorage`, envíalo como Bearer en las peticiones protegidas y dirige al listado después del login.
- **Protección y cierre manual · 1 punto.** Restringe el listado y el detalle a usuarios con sesión. Incluye una acción de cierre de sesión que limpie el token y vuelva al login.

## 2. Listado · 4 puntos

- **Consulta y campos · 1.5 puntos.** En `/workshops`, consulta la API y muestra nombre, disciplina, fecha y vacantes.
- **Paginación · 1.5 puntos.** Muestra la página actual y el total. Agrega Anterior y Siguiente, deshabilitados en sus respectivos límites. Cada cambio de página consulta el servidor.
- **Estados · 1 punto.** Muestra un indicador durante la consulta y un mensaje cuando el listado esté vacío.

## 3. Detalle y operación · 4 puntos

- **Detalle · 1 punto.** Abre `/workshops/:id` desde el listado y consulta el registro por ID. Muestra la hora y las vacantes de cada sesión. Usa un selector de sesión y un selector de nivel.
- **Validación · 1 punto.** Selecciona una sesión y un nivel de experiencia: inicial, intermedio o avanzado. Ambos campos son obligatorios. Muestra los errores junto a los campos antes de enviar.
- **Operación y resultado · 2 puntos.** Envía el formulario mediante la operación indicada en el contrato. Tras inscribirte, actualiza las vacantes del taller.

## 4. Errores e interfaz · 3 puntos

- **Sesión inválida · 1 punto.** Si una petición protegida devuelve `401`, limpia la sesión y redirige al login.
- **Conflicto del caso · 1 punto.** Cuando la API devuelva el código de conflicto evaluado en el contrato, muestra «Ya tienes una inscripción en esta sesión.» junto al formulario. Prueba el caso descrito en el contrato.
- **Estructura y presentación · 1 punto.** Usa componentes reutilizables con props tipadas y un diseño legible con Tailwind. Agrupa los controles de paginación y etiqueta los campos del formulario.

**Total máximo: 14 puntos.**
