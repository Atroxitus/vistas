function deleteAccount() {
    
    alert("Cuenta borrada exitosamente.");
}

async function actualizarUsuario(req, res) {
    try {
        const usuario = document.getElementById('nombre').value;
        
        const email = document.getElementById('email').value;
      
      // Realizar la solicitud Fetch
      const response = await fetch(`http://localhost:3000/usuarios/${email} `, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario: usuario,
          email: email
        })
      });
      
      // Verificar el estado de la respuesta
      if (response.ok) {
        const data = await response.json();
        console.log(data); 
        // Actualizar la interfaz de usuario 
      } else {
        console.error('Error al actualizar usuario:', response.status);
        // Manejar el error de acuerdo a tu aplicación
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Manejar el error de acuerdo a tu aplicación
    }
  }

  async function borrarPerfil() {
    try {
        const email = document.getElementById('emailDelete').value;

        const response = await fetch(`http://localhost:3000/usuarios/${email}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Perfil eliminado exitosamente');
            
        } else {
            console.error('Error al borrar perfil:', response.status);
            // Manejar el error de acuerdo a tu aplicación
        }
    } catch (error) {
        console.error('Error al borrar perfil:', error);
        // Manejar el error de acuerdo a tu aplicación
    }
}