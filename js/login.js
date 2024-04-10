
if (localStorage.getItem('userId')) {
    
}

document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Evita el envío del formulario por defecto
//variables donde se almacenan los datos
  const email = document.getElementById('email').value;
  const contrasena = document.getElementById('contrasena').value;

  // ♣ 
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, contrasena })
  }).then((res) => {
    return res.json();
  }).then((response) => {
    if (response.res = 'ok') {
      const responseData = response;
      const token = responseData.token; // O algún otro identificador
      // Almacenar el token o identificador en el almacenamiento local
      
      localStorage.setItem('userId', String(response.data));
      // Redirigir al usuario al perfil.html
      window.location.href = "/envio.html";
    }
  }).catch((error) => {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión. Por favor, intenta nuevamente.");
  });
});