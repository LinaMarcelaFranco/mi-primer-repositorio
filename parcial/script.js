// --- Selección de los elementos del DOM ---
const corte1Input = document.getElementById('corte1');
const corte2Input = document.getElementById('corte2');
const resultadoDiv = document.getElementById('resultado');
const dynamicBackground = document.getElementById('dynamic-background'); 
const calcularBtn = document.getElementById('calcularBtn'); // NUEVO: Selecciona el botón de cálculo

// Clase base y clases de estado de Tailwind para el resultado
const BASE_CLASSES = 'p-4 rounded-lg text-center font-semibold border transition-all duration-300';
const SUCCESS_CLASSES = 'bg-green-50 border-green-600 text-green-600';
const ERROR_CLASSES = 'bg-red-50 border-red-600 text-red-600';
const INFO_CLASSES = 'bg-indigo-50 border-indigo-600 text-indigo-600';


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
    resultadoDiv.className = BASE_CLASSES; // Resetea las clases

    // 1. Validación de campos vacíos
    if (corte1Str === '' || corte2Str === '') {
        resultadoDiv.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Por favor, ingresa las notas de los dos primeros cortes.';
        resultadoDiv.classList.add(...ERROR_CLASSES.split(' '));
        return;
    }

    // 2. Validación de guion solitario (-) (la validación que solicitaste)
    if (corte1Str === '-' || corte2Str === '-') {
        resultadoDiv.innerHTML = '<strong>Error:</strong> El guion solo no es un número válido. Por favor, ingresa una nota entre 0 y 5.';
        resultadoDiv.classList.add(...ERROR_CLASSES.split(' '));
        return;
    }

    // Prepara los valores para el cálculo
    const corte1Value = corte1Str.replace(',', '.');
    const corte2Value = corte2Str.replace(',', '.');
    
    const corte1 = parseFloat(corte1Value);
    const corte2 = parseFloat(corte2Value);

    // 3. Validación de formato de número incorrecto (ej: "3.4.5" o solo "."), que resulta en NaN
    if (isNaN(corte1) || isNaN(corte2)) {
        resultadoDiv.innerHTML = '<i class="fas fa-times-circle mr-2"></i> Formato de número no válido. Revisa las notas ingresadas (ejemplo: "3.4").';
        resultadoDiv.classList.add(...ERROR_CLASSES.split(' '));
        return;
    }

    // 4. Verificación del rango (0 a 5)
    if (corte1 < 0 || corte1 > 5 || corte2 < 0 || corte2 > 5) {
        resultadoDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i> Las notas deben estar entre 0 y 5.';
        resultadoDiv.classList.add(...ERROR_CLASSES.split(' '));
        return;
    }

    // Cálculo de la nota necesaria para el tercer corte (34%)
    // Fórmula: Nota3 = (NotaMinima - (Corte1 * 0.33) - (Corte2 * 0.33)) / 0.34
    const notaNecesaria = (notaMinima - (corte1 * 0.33) - (corte2 * 0.33)) / 0.34;
    const notaFormateada = notaNecesaria.toFixed(2);

    // Mostrar el resultado final
    if (notaNecesaria > 5) {
        resultadoDiv.innerHTML = `<i class="fas fa-sad-cry text-red-600 mr-2"></i> Necesitas sacar <strong>${notaFormateada}</strong>. <br>¡Es **imposible** aprobar! 😥`;
        resultadoDiv.classList.add(...ERROR_CLASSES.split(' '));
    } else if (notaNecesaria <= 0) {
        resultadoDiv.innerHTML = `<i class="fas fa-award text-green-600 mr-2"></i> ¡Felicidades! 🎉 Ya has aprobado. Necesitas un **0.00**.`;
        resultadoDiv.classList.add(...SUCCESS_CLASSES.split(' '));
    } else {
        resultadoDiv.innerHTML = `<i class="fas fa-bolt text-indigo-600 mr-2"></i> Para aprobar, necesitas sacar <strong>${notaFormateada}</strong> en el último corte. 💪`;
        resultadoDiv.classList.add(...INFO_CLASSES.split(' '));
    }

    // --- NUEVO: Cambio de color del botón a verde permanente después del cálculo ---
    calcularBtn.classList.remove('bg-blue-600', 'focus:ring-blue-500'); // Quitar color base azul y focus azul
    calcularBtn.classList.add('bg-green-600', 'focus:ring-green-500'); // Añadir color base verde y focus verde
    // El efecto hover:bg-green-700 se mantiene, lo que resulta en un hover más oscuro sobre el verde.
}

// ----------------------------------------------------------------------
// --- CÓDIGO PARA EL FONDO DINÁMICO ---
// ----------------------------------------------------------------------

const SYMBOLS = ['0', '1', '2', '3', '4', '5', '+', '-', '*', '=', '∑', '∫', 'd/dx', '√'];
const NUM_SYMBOLS = 50; // Cantidad de símbolos flotantes

function createSymbol() {
    const symbol = document.createElement('span');
    symbol.classList.add('symbol');
    
    // Contenido aleatorio
    const randomContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    symbol.textContent = randomContent;

    // Posición horizontal aleatoria (0% a 100% del ancho)
    symbol.style.left = `${Math.random() * 100}vw`;

    // Tamaño de fuente aleatorio
    symbol.style.fontSize = `${Math.random() * 1.5 + 0.8}rem`; // Entre 0.8rem y 2.3rem

    // Duración de la animación (velocidad) aleatoria
    symbol.style.animationDuration = `${Math.random() * 20 + 10}s`; // Entre 10s y 30s

    // Retraso de la animación (para que no empiecen todos al mismo tiempo)
    symbol.style.animationDelay = `-${Math.random() * 10}s`; // Empieza en un punto aleatorio

    // Añadir al contenedor
    dynamicBackground.appendChild(symbol);

    // Eliminar después de que termine la animación (para optimizar)
    symbol.addEventListener('animationend', () => {
        symbol.remove();
        // Genera uno nuevo inmediatamente para un flujo constante
        createSymbol();
    });
}

// Generar todos los símbolos iniciales
for (let i = 0; i < NUM_SYMBOLS; i++) {
    createSymbol();
}