//dependecias necesarias para el servidor
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const fs = require('fs');
const path = require('path');
const { error } = require("console");
const app = express();
dotenv.config();


// servicio de archivos estaticos 

app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/IMG', express.static(path.join(__dirname, 'IMG')));
app.use(express.static(path.join(__dirname, 'public')));



// Configure body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//configuracion del cors
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const port = process.env.PORT || 3000;
//conexion a la bd
const connectionString = process.env.EXTERNAL_POSTGRESQL_RENDER;
const pool = new Pool({
  connectionString,
});







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
app.get("/usuarios/:email", obtenerUsuarioPorId);
app.put("/usuarios/:email", actualizarUsuario);
app.delete("/usuarios/:email", eliminarUsuario);

//Requerimentos para el hash
const bcrypt = require('bcrypt');
const saltRounds = 10;


// ♣ 
async function crearUsuario(req, res) {
  try {
    const pool = new Pool({
      connectionString,
    });
    const { usuario, email, contrasena, id_encuesta } = req.body;
    if (!usuario || !email || !contrasena) {
      return res.status(400).send("Missing required fields");
    }

    const client = await pool.connect();
    const checkEmail = await client.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).send("Email already exists");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    const result = await client.query(
      `INSERT INTO usuarios (usuario, email, contrasena) 
       VALUES ($1, $2, $3) RETURNING *`,
      [usuario, email, hashedPassword,] // Usar la contraseña hasheada en lugar de la original
    );
    const newUser = result.rows[0];
    // Redirigir al usuario a la página de perfil
    res.json({ "response": "ok", ms: "Credenciales inválidas", data: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
}



// Ruta para iniciar sesión
app.post("/login", iniciarSesion);


//comparar contraseña hasheada para que el login sea exitoso
async function iniciarSesion(req, res) {
  try {
    const { email, contrasena } = req.body;

    // Buscar el usuario por su correo electrónico en la base de datos
    const user = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    // Si el usuario no existe
    if (user.rows.length === 0) {
      return res.status(401).send("Usuario no encontrado");
    }

    // Comparar la contraseña hasheada almacenada con la contraseña proporcionada por el usuario
    const hashedPassword = user.rows[0].contrasena;
    const match = await bcrypt.compare(contrasena, hashedPassword);

    // Si las contraseñas no coinciden
    if (!match) {
      return res.status(401).send("Contraseña incorrecta");
    }

    // Si las contraseñas coinciden, el usuario está autenticado
    return res.status(201).json({ res: 'ok', ms: "Credenciales inválidas", data: user.rows[0].email });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error de autenticación");
  }
}


app.get('/logout', cerrarSesion);
// Ruta para cerrar sesión
function cerrarSesion(req, res) {
  try {
    // Lógica para cerrar la sesión aquí
    res.clearCookie("sessionId"); 
    res.redirect('index.html'); // Redirige al usuario a la página de inicio
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).send("Error al cerrar sesión");
  }
}

//funcion para obtener los usuarios
async function obtenerUsuarios(req, res) {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).send("Error al obtener usuarios");
  }
}
//funcion para obtener usuarios por correo
async function obtenerUsuarioPorId(req, res) {
  try {
    const { email } = req.params;
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
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
//funcion para actualizar los usuarios
async function actualizarUsuario(req, res) {
  try {
    const { email } = req.params;
    const { usuario } = req.body;


    const result = await pool.query(
      "UPDATE usuarios SET   usuario = $1  WHERE email = $2 RETURNING *",
      [usuario, email]
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
//funcion para eliminar usuario
async function eliminarUsuario(req, res) {
  try {
    const { email } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE email = $1", [email]);
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


app.get("/puntuacionn/:idp", obtenerDato);
//app.put("/puntuacion/:idp", actualizarDato);
app.delete("/puntuacion/:idp", eliminarDato);

app.post('/puntuacion', async (req, res) => {
  const datosRecibidos = req.body; // Obtén los datos del cuerpo de la solicitud

  try {
    const result = await pool.query(
      "INSERT INTO puntuacion (personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital) VALUES ($1, $2, $3, $4)  RETURNING *",
      [datosRecibidos.avgPrimera, datosRecibidos.avgPrimera2, datosRecibidos.avgPrimera3, datosRecibidos.avgPrimera4]
    );


    console.log("Datos insertados en la base de datos:", result.rows[0]);
    res.status(200).json({ ms: "Datos recibidos y procesados correctamente", data: result.rows[0] });

  } catch (error) {
    console.error("Error al procesar los datos:", error);
    res.status(500).send("Error al procesar los datos");
  }
});


//funcion para obtener puntuacion por idp

app.get('/puntuacionnn/:idp', async (req, res) => {
  const idp = req.params.idp;

  try {
    const result = await pool.query(
      "SELECT * FROM puntuacion WHERE idp = $1",
      [idp]
    );

    if (result.rows.length > 0) {
      const data = result.rows[0];
      res.json(data);
    } else {
      res.status(404).json({ error: 'No se encontraron datos para el IDP proporcionado' });
    }
  } catch (error) {
    console.error("Error al obtener los datos de la puntuación:", error);
    res.status(500).json({ error: 'Error al obtener los datos de la puntuación' });
  }
});






 //funcion para obtener todos los datos de la tabla puntuacion
async function obtenerDato(req, res) {
  try {
    const { idp } = req.params;
    const result = await pool.query("SELECT personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital FROM puntuacion WHERE idp = $1", [idp]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send(" no encontrado");
    }
  } catch (error) {
    console.error("Error ", error);
    res.status(500).json("Error ");
  }
}

async function actualizarDato(req, res) {
  try {
    const { id } = req.params;
    const { titulo, fecha, descripcion, usuario_id } = req.body;
    const result = await pool.query(
      "UPDATE puntuacion SET  = $1,  = $2, = $3,  = $4 WHERE  = $5 RETURNING *",
      [titulo, fecha, descripcion, usuario_id, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Evento no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar :", error);
    res.status(500).json("Error al actualizar ");
  }
}
//funcion para eliminar datos por idp
async function eliminarDato(req, res) {
  try {
    const { idp } = req.params;
    const result = await pool.query("DELETE  FROM puntuacion WHERE idp = $1", [idp]);
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

app.get("/datos-tabla", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM puntuacion");

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ error: 'No se encontraron datos en la tabla de puntuación' });
    }
  } catch (error) {
    console.error("Error al obtener los datos de la puntuación:", error);
    res.status(500).json({ error: 'Error al obtener los datos de la puntuación' });
  }
});
//personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital

app.put(`actualizar-dato/:idp`, actualizarDatos);
async function actualizarDatos(req, res) {
  try {
    const { idp } = req.params;
    const { personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital} = req.body;
    const result = await  pool.query(
      "UPDATE puntuacion SET  personas_y_cultura_digital = $1, procesos_de_la_entidad = $2,datos_digitales_y_analytics = $3,   tecnologia_digital= $4 WHERE idp = $5 RETURNING *",
      [personas_y_cultura_digital, procesos_de_la_entidad, datos_digitales_y_analytics,  tecnologia_digital, idp]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json("Evento no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar :", error);
    res.status(500).json("Error al actualizar ");
  }
}




// Configuración del puerto y arranque del servidor


app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});