var inputs = document.querySelectorAll(".color");

inputs.forEach(function (input) {
  input.addEventListener("input", function () {
    var valor = input.value;
    input.setAttribute("data-value", valor);
  });
});

var inputs = document.getElementsByClassName("color");

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("input", function () {
    var valor = parseInt(this.value);

    if (isNaN(valor) || valor < 0 || valor > 4) {
      // Si el valor ingresado no es un número, es negativo o mayor que 5
      // Establecemos el valor del input como vacío
      this.value = "";
    } 
    if(valor < 0 || valor > 4) {
      document.querySelector("#errorplus").style.display = "block";
      setTimeout(() => {
        document.querySelector("#errorplus").style.display = "none";
      }, 1200);
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  // Por ejemplo, puedes agregar código para cargar datos desde el back-end
});
