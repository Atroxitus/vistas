document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formularioEncuesta").addEventListener("submit", function (event) {
        event.preventDefault(); // Evitar el envío por defecto del formulario
//se crea un array para almacenar los datos 
        let allItems = [];
        let isValid = true;
        const ouItem = document.querySelectorAll('input');
        Array.from(ouItem).map((r) => {
            let item = '';
            let last = 0;
            let ids = r.getAttribute('id');
//condiciones para obtener los datos  con el id del input
            if (ids != null) {
                if (ids.includes("primera")) {
                    last = ids[ids.length - 1];
                    allItems.push({ type: 'primera', item: parseInt(last), value: parseInt(r.value) });
                }
                if (ids.includes("segunda")) {
                    last = ids[ids.length - 1];
                    allItems.push({ type: 'segunda', item: parseInt(last), value: parseInt(r.value) });
                }
                if (ids.includes("tercera")) {
                    last = ids[ids.length - 1];
                    allItems.push({ type: 'tercera', item: parseInt(last), value: parseInt(r.value) });
                }
                if (ids.includes("cuarta")) {
                    last = ids[ids.length - 1];
                    allItems.push({ type: 'cuarta', item: parseInt(last), value: parseInt(r.value) });
                }
            }
        });
        //se separan dependiendo de su id 
        const onlyType = allItems.filter((a) => a.type.includes('primera'));
        const arraicito = [];
        onlyType.map((r) => {
            arraicito.push(r.value);
        });
        //funcion para sacar el promedio 
        let sum = arraicito.reduce((previous, current) => current += previous);
        let avgPrimera = sum / onlyType.length;

        // console.log(sum, avgPrimera);

        const onlyType2 = allItems.filter((a) => a.type.includes('segunda'));
        const arraicito2 = [];
        onlyType2.map((r) => {
            arraicito2.push(r.value);
        });
        let sum2 = arraicito2.reduce((previous, current) => current += previous);
        let avgPrimera2 = sum2 / onlyType2.length;

        // console.log(sum2, avgPrimera2);

        const onlyType3 = allItems.filter((a) => a.type.includes('tercera'));
        const arraicito3 = [];
        onlyType3.map((r) => {
            arraicito3.push(r.value);
        });

        let sum3 = arraicito3.reduce((previous, current) => current += previous);
        let avgPrimera3 = sum3 / onlyType3.length;

        // ♣ console.log(sum3, avgPrimera3);

        const onlyType4 = allItems.filter((a) => a.type.includes('cuarta'));
        const arraicito4 = [];
        onlyType4.map((r) => {
            arraicito4.push(r.value);
        });
        let sum4 = arraicito4.reduce((previous, current) => current += previous);
        let avgPrimera4 = sum4 / onlyType4.length;

        // console.log(sum4, avgPrimera4);



        console.log(Math.round(avgPrimera));
        console.log(Math.round(avgPrimera2));
        console.log(Math.round(avgPrimera3));
        console.log(Math.round(avgPrimera4));


         //se almacenan en una variable con un redondeo a numero natural
        const data = {
            avgPrimera: Math.round(avgPrimera),
            avgPrimera2: Math.round(avgPrimera2),
            avgPrimera3: Math.round(avgPrimera3),
            avgPrimera4: Math.round(avgPrimera4),
        };

        // ♣
        fetch('http://localhost:3000/puntuacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Encuesta enviada correctamente:', data);
            localStorage.setItem('idpi', data.data.idp); // Almacenar el IDP en el localStorage
            window.location.href = "/grafico.html";
        })
        .catch(error => {
            console.error('Error al enviar la encuesta:', error);
            });
        });
 }    )