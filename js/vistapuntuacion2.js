// Función para cargar los datos desde la base de datos
function cargarDatos() {
    fetch(`http://localhost:3000/datos_tabla`)
        .then(response => response.json())
        .then(data => {
            const tablaBody = document.querySelector('#tablaDatos tbody');
            tablaBody.innerHTML = '';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${row.idp}</td>
                <td contenteditable>${row.personas_y_cultura_digital}</td>
                <td contenteditable>${row.procesos_de_la_entidad}</td>
                <td contenteditable>${row.datos_digitales_y_analytics}</td>
                <td contenteditable>${row.tecnologia_digital}</td>
                <td><button onclick="eliminarDato(${row.idp})">Eliminar</button></td>
            `;
                tablaBody.appendChild(tr);
            });
        });
}

// Función para eliminar un dato
function eliminarDato(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este dato?')) {
        fetch(`http://localhost:3000/eliminar/${id}`, {
            method: 'DELETE'
        })

            .then(data => {
                if (data.success) {
                    cargarDatos();
                } else {
                    alert('datos eliminados');
                }
            });
    }
}


function actualizarDatoss() {
    const idp = document.getElementById('inputId').value;
if (!idp) {
    alert('No se ha proporcionado un ID válido.');
    return;
}

    const tablaBody = document.querySelector('#tablaDatos tbody');
    const rows = tablaBody.querySelectorAll('tr');

    const updatedData = {};

    rows.forEach(row => {
        const id = row.querySelector('td:first-child').textContent;
        const personas_y_cultura_digital = row.querySelector('td:nth-child(2)').textContent;
        const  procesos_de_la_entidad = row.querySelector('td:nth-child(3)').textContent;
        const datos_digitales_y_analytics = row.querySelector('td:nth-child(4)').textContent;
        const  tecnologia_digital = row.querySelector('td:nth-child(5)').textContent;

        updatedData[id]={ ipd:id,
            personas_y_cultura_digital: personas_y_cultura_digital,
             procesos_de_la_entidad:  procesos_de_la_entidad,
              datos_digitales_y_analytics: datos_digitales_y_analytics,
               tecnologia_digital:  tecnologia_digital
            };
    });

  
   

    fetch(`http://localhost:3000/actualizar_dato/${idp}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        
        .then(response => {
            if (response.ok) {
                alert('Datos actualizados exitosamente.');
                cargarDatos();
            } else {
                alert('Error al actualizar los datos.');
            }
        })
         .catch(error => {
console.error('Error al enviar la solicitud:', error);
alert('Error al enviar la solicitud.');
});
}
// Cargar los datos al cargar la página
cargarDatos();