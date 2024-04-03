const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const fs = require('fs');
const path = require('path');
const app = express();
dotenv.config();

// Configure body-parser middleware

app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/IMG', express.static(path.join(__dirname, 'IMG')));
app.use(express.static(path.join(__dirname, 'public')));




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

const port = process.env.PORT || 3000;

const connectionString = process.env.EXTERNAL_POSTGRESQL_RENDER;
const pool = new Pool({
  connectionString,
});



// Middleware
app.use(cors());
app.use(express.json());


// Creación de las tablas en la base de datos al iniciar el servidor

async function crearTablas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS puntuacion (
        personas_y_cultura_digital int,
        procesos_de_la_entidad int,
        datos_digitales_y_analytics int,
        tecnologia_digital int
      )
    `);

    

    console.log("Tablas creadas correctamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  }
  
}

// Llamada a la función de creación de tablas al iniciar el servidor
/*crearTablas();*/

// Rutas y controladores para CRUD de usuarios

app.post("/usuarios", crearUsuario);
app.get("/usuarios", obtenerUsuarios);
app.get("/usuarios/:nombre", obtenerUsuarioPorId);
app.put("/usuarios/:nombre", actualizarUsuario);
app.delete("/usuarios/:nombre", eliminarUsuario);

async function crearUsuario(req, res) {
  try {
    const pool = new Pool({
      connectionString,
    });
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).send("Missing required fields");
    }

    const client = await pool.connect();
    const checkEmail = await client.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).send("Email already exists");
    }

    const result = await client.query(
      `INSERT INTO usuarios (nombre, correo, contrasena) 
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, correo, contrasena]
    );
    const newUser = result.rows[0];

    // Redirigir al usuario a la página de perfil
    const indexlHTML = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    res.send(indexlHTML);


  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
}
// Ruta para iniciar sesión
app.post("/login", iniciarSesion);

async function iniciarSesion(req, res) {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).send("Correo y contraseña son requeridos");
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1 AND contrasena = $2",
      [correo, contrasena]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Credenciales inválidas");
    }

    // Si las credenciales son válidas, redirige al usuario al perfil.html
    res.redirect("index.html");

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error al iniciar sesión");
  }
}
app.get('/logout', cerrarSesion);
// Ruta para cerrar sesión
function cerrarSesion(req, res) {
  try {
    // Lógica para cerrar la sesión aquí
    res.clearCookie("sessionId"); // Reemplaza "sessionId" con el nombre de tu cookie de sesión
    res.redirect('index.html'); // Redirige al usuario a la página de inicio
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).send("Error al cerrar sesión");
  }
}


async function obtenerUsuarios(req, res) {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).send("Error al obtener usuarios");
  }
}

async function obtenerUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener usuario por correo:", error);
    res.status(500).send("Error al obtener usuario por correo");
  }
}
async function actualizarUsuario(req, res) {
  try {
    const { correo } = req.params;
    const { nombre,  contrasena } = req.body;
    const result = await pool.query(
      "UPDATE usuarios SET nombre = $1,  contrasena = $2 WHERE correo = $3 RETURNING *",
      [nombre,  correo, contrasena]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).send("Error al actualizar usuario");
  }
}

async function eliminarUsuario(req, res) {
  try {
    const { correo } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE correo = $1", [correo]);
    if (result.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).send("Error al eliminar usuario");
  }
}

// Funciones controladoras CRUD para puntuacion

app.post("/puntuacion", crearDato);
app.get("/puntuacion", obtenerDato);
app.put("/puntuacion/:correo", actualizarDato);
app.delete("/puntuacion/:correo", eliminarDato);



/*personas_y_cultura_digital int,
        procesos_de_la_entidad int,
        datos_digitales_y_analytics int,
        tecnologia_digital int*/

async function crearDato(req, res) {
  try {
    const {personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital } = req.body;
    const result = await pool.query(
      "INSERT INTO eventos_calendario (personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital) VALUES ($1, $2, $3, $4) RETURNING *",
      [personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear dato:", error);
    res.status(500).send("Error al crear dato");
  }
}

async function obtenerDato(req, res) {
  try {
    const result = await pool.query("SELECT * FROM puntuacion");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener dato:", error);
    res.status(500).send("Error al obtener dato");
  }
}


async function actualizarDato(req, res) {
  try {
    const { id } = req.params;
    const { titulo, fecha, descripcion, usuario_id } = req.body;
    const result = await pool.query(
      "UPDATE eventos_calendario SET titulo = $1, fecha = $2, descripcion = $3, usuario_id = $4 WHERE id = $5 RETURNING *",
      [titulo, fecha, descripcion, usuario_id, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Evento no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(500).send("Error al actualizar evento");
  }
}

async function eliminarDato(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM eventos_calendario WHERE id = $1", [id]);
    if (result.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).send("Evento no encontrado");
    }
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(500).send("Error al eliminar evento");
  }
}





// Configuración del puerto y arranque del servidor


app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});