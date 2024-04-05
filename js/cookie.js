const express = require('express');
const cookieParser = require('cookie-parser');
const uuid = require('uuid'); // Para generar identificadores únicos de sesión

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ruta para iniciar sesión
app.post("/login", (req, res) => {
    const { email, contrasena } = req.body;

    // Validar las credenciales del usuario (simulado)
    if (email === "usuario@example.com" && contrasena === "contrasena") {
        // Generar un identificador único de sesión
        const sessionId = uuid.v4();

        // Establecer una cookie de sesión
        res.cookie('sessionId', sessionId, { httpOnly: true });

        // Redirigir al usuario a la página de inicio después de iniciar sesión
        res.redirect('/inicio');
    } else {
        res.send("Credenciales incorrectas");
    }
});

// Middleware para verificar la sesión en cada solicitud
app.use((req, res, next) => {
    // Verificar si la cookie de sesión está presente y es válida
    if (req.cookies.sessionId && validarSesion(req.cookies.sessionId)) {
        // La sesión del usuario es válida, continuar con la solicitud
        next();
    } else {
        // La sesión del usuario no es válida, redirigir al usuario a la página de inicio de sesión
        res.redirect('/login');
    }
});

// Ruta protegida que el usuario puede acceder después de iniciar sesión
app.get("/inicio", (req, res) => {
    res.send("Bienvenido a la página de inicio");
});

// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
    // Eliminar la cookie de sesión
    res.clearCookie('sessionId');
    res.redirect('/login');
});

// Función para validar la sesión del usuario (simulado)
function validarSesion(sessionId) {
    // Aquí puedes realizar la validación de la sesión contra una base de datos u otra fuente de datos
    // En este ejemplo, simplemente simulamos que la sesión es válida si el sessionId no está vacío
    return sessionId !== '';
}

app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
});
