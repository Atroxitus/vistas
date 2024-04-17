//fucion para almacenar los datos del registro 
document.getElementById('reg').addEventListener('submit', function (event) {
    event.preventDefault(); 
//variables donde se almacenan los datos
    const usuario = document.getElementById('usuario').value;
    const email = document.getElementById('email').value;
    const contrasena = document.getElementById('contrasena').value;

//aqui se llama la funcion para anexar la informacion a la BD
    fetch('http://localhost:3000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario, email, contrasena })
    }).then((res) => {
      return res.json();
    }).then((res) => {
      if (res.response == 'ok') {
        // Redirigir al usuario al login.html.
        localStorage.setItem('userId', String(res.data.email));
        window.location.href = "login.html";
      } 
    }).catch((error) => {
      console.error("Error al registrarse", error);
      alert("Error al registrarse. Por favor, intenta nuevamente.");
    });

  });


 