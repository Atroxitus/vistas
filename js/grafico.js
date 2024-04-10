let myChart;

    async function obtenerDatos(idp) {
      // Realizar una solicitud GET para obtener los datos de la puntuación
      fetch(`http://localhost:3000/puntuacionn/${idp}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('No se encontraron datos para el IDP proporcionado');
          }
          return response.json();
        })
        .then(data => {
          // Datos para la gráfica
          const labels = ['Personas y Cultura Digital', 'Procesos de la Entidad', 'Datos Digitales y Analytics', 'Tecnología Digital'];
          const valores = [data.personas_y_cultura_digital, data.procesos_de_la_entidad, data.datos_digitales_y_analytics, data.tecnologia_digital];
          
          // Si la gráfica ya existe, destrúyela para crear una nueva
          if (myChart) {
            myChart.destroy();
          }
          
          // Configurar el contexto y los datos para la gráfica
          const ctx = document.getElementById('myChart').getContext('2d');
          
          myChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Puntuación',
                data: valores,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        })
        .catch(error => console.error('Error al obtener los datos:', error));
    }

    // Obtener el IDP del localStorage y mostrar la gráfica correspondiente
    const idpGuardado = localStorage.getItem('idpi');
    if (idpGuardado) {
      obtenerDatos(idpGuardado);
    }