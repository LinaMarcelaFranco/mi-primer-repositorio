// --- Selección de los elementos del DOM ---
const corte1Input = document.getElementById('corte1');
const corte2Input = document.getElementById('corte2');
const resultadoDiv = document.getElementById('resultado');

// Función auxiliar para forzar la visualización del resultado
const mostrarResultado = () => {
    resultadoDiv.classList.remove('hidden');
};

// --- Validación en tiempo real para los campos de entrada ---

// Función para validar que el valor esté dentro del rango numérico (0 a 5) y limpiar caracteres
const validarInput = (event) => {
    let valueStr = event.target.value.replace(',', '.');
    let value = parseFloat(valueStr);

    // Permitir el guion inicial (-) solo si no hay otros números. Esto ayuda a la UX.
    if (valueStr.trim() === '-') {
        return;
    }

    // Si el valor no es un número (ej. si el campo está vacío o empieza con letra)
    if (isNaN(value)) {
        // Limpia caracteres no permitidos (solo números, punto y coma)
        const validCharRegex = /[^0-9,.]/g;
        if (validCharRegex.test(event.target.value)) {
            event.target.value = event.target.value.replace(validCharRegex, '');
        }
        return;
    }

    // A partir de aquí, 'value' es un número válido

    // Si el valor es negativo, se establece en 0
    if (value < 0) {
        event.target.value = '0';
    }
    // Si el valor es mayor a 5, se establece en 5
    if (value > 5) {
        event.target.value = '5';
    }
};

// Se asigna el evento 'input' a cada campo para validar mientras el usuario escribe
corte1Input.addEventListener('input', validarInput);
corte2Input.addEventListener('input', validarInput);


// --- Función principal para calcular la nota necesaria ---
function calcularNota() {
    const corte1Str = corte1Input.value.trim();
    const corte2Str = corte2Input.value.trim();
    const notaMinima = 3.0;

    mostrarResultado();
    resultadoDiv.className = 'resultado-container'; // Resetea clases

    // 1. Validación de campos vacíos
    if (corte1Str === '' || corte2Str === '') {
        resultadoDiv.innerHTML = "Por favor, ingresa las notas de los dos primeros cortes.";
        resultadoDiv.classList.add('error');
        return;
    }

    // 2. Validación de guion solitario (-) (la validación que solicitaste)
    if (corte1Str === '-' || corte2Str === '-') {
        resultadoDiv.innerHTML = "<strong>Error:</strong> El guion solo no es un número válido. Por favor, ingresa una nota entre 0 y 5.";
        resultadoDiv.classList.add('error');
        return;
    }

    // Prepara los valores para el cálculo
    const corte1Value = corte1Str.replace(',', '.');
    const corte2Value = corte2Str.replace(',', '.');
    
    const corte1 = parseFloat(corte1Value);
    const corte2 = parseFloat(corte2Value);

    // 3. Validación de formato de número incorrecto (ej: "3.4.5" o solo "."), que resulta en NaN
    if (isNaN(corte1) || isNaN(corte2)) {
        resultadoDiv.innerHTML = "Formato de número no válido. Revisa las notas ingresadas (ejemplo: '3.4').";
        resultadoDiv.classList.add('error');
        return;
    }

    // 4. Verificación del rango (0 a 5)
    if (corte1 < 0 || corte1 > 5 || corte2 < 0 || corte2 > 5) {
        resultadoDiv.innerHTML = "Las notas deben estar entre 0 y 5.";
        resultadoDiv.classList.add('error');
        return;
    }

    // Cálculo de la nota necesaria para el tercer corte (34%)
    // Fórmula: Nota3 = (NotaMinima - (Corte1 * 0.33) - (Corte2 * 0.33)) / 0.34
    const notaNecesaria = (notaMinima - (corte1 * 0.33) - (corte2 * 0.33)) / 0.34;

    // Mostrar el resultado final
    if (notaNecesaria > 5) {
        resultadoDiv.innerHTML = `Necesitas sacar <strong>${notaNecesaria.toFixed(2)}</strong>. <br>¡Es imposible aprobar! 😥`;
        resultadoDiv.classList.add('error');
    } else if (notaNecesaria <= 0) {
        resultadoDiv.innerHTML = `¡Felicidades! 🎉 Ya has aprobado la materia. Necesitas un <strong>0.00</strong>.`;
        resultadoDiv.classList.add('success');
    } else {
        resultadoDiv.innerHTML = `Para aprobar, necesitas sacar <strong>${notaNecesaria.toFixed(2)}</strong> en el último corte. 💪`;
        resultadoDiv.classList.add('info');
    }
}
