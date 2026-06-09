/**
 * Blobe - Dron Agropecuario Autónomo con Edge AI
 * Script de interactividad y simulador de telemetría local
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMobileMenu();
    initTelemetrySimulator();
});

/* ==========================================================================
   1. Animaciones al hacer Scroll (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    // Opciones del observador
    const observerOptions = {
        root: null, // viewport del navegador
        rootMargin: '0px',
        threshold: 0.12 // El elemento se activa cuando el 12% es visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Dejamos de observar el elemento una vez revelado
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/* ==========================================================================
   2. Menú de Navegación Móvil
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    // Alternar menú al hacer clic en el botón hamburguesa
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Bloquear scroll del body al estar activo el menú
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en cualquier enlace
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Asegurar que el menú se cierre si la ventana se agranda a escritorio
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ==========================================================================
   3. Simulador de Telemetría Edge AI
   ========================================================================== */
function initTelemetrySimulator() {
    const consoleContainer = document.getElementById('terminalConsole');
    const btnStart = document.getElementById('btnStartTelemetry');
    const btnClear = document.getElementById('btnClearTelemetry');
    const statusIndicator = document.getElementById('statusIndicator');

    let isRunning = false;
    let telemetryTimeout = null;
    let sequenceIndex = 0;

    // Líneas iniciales que ya están cargadas en el HTML al iniciar la consola
    const initialHTML = consoleContainer.innerHTML;

    // Secuencias de telemetría de simulación
    const telemetrySequence = [
        { text: '[sys] Initializing PiCamera2 interface... OK', type: 'info', delay: 800 },
        { text: '[ai] Warm-up inference complete. Average latency: 28.4ms', type: 'success', delay: 600 },
        { text: '[cv2] Processing frame stream at 30fps...', type: 'info', delay: 1000 },
        { text: '[gps] Coordinates: Lat -34.6037, Lng -58.3816 | Altitude: 15.2m', type: 'muted', delay: 1200 },
        { text: '>> VUELO EN CURSO - Altitud: 15.2m | Velocidad: 4.1m/s | Batería: 88%', type: 'info', delay: 1000 },
        { text: '<span class="t-yellow">[ALERT] Anomalía detectada: Estrés hídrico en Sector 7B. Probabilidad: 92%</span>', type: 'raw', delay: 1500 },
        { text: '<span class="t-blue">[nav] Calculando nueva ruta de aspersión... Ajustando yaw/pitch.</span>', type: 'raw', delay: 1000 },
        { text: '[actuator] Activando válvula solenoide 3 (dosificación focalizada: 15ml/s)', type: 'success', delay: 1200 },
        { text: '[actuator] Aspersión completada en Sector 7B. Cerrando válvula.', type: 'info', delay: 800 },
        { text: '[gps] Coordinates: Lat -34.6039, Lng -58.3819 | Altitude: 15.0m', type: 'muted', delay: 1200 },
        { text: '>> VUELO EN CURSO - Altitud: 15.0m | Velocidad: 3.8m/s | Batería: 85%', type: 'info', delay: 1000 },
        { text: '[cv2] Hojas analizadas: 412 | Índice de salud promedio (NDVI): 0.78', type: 'info', delay: 1400 },
        { text: '<span class="t-red">[ALERT] Foco de plaga detectado (Aphis gossypii) en Sector 3A. Probabilidad: 97%</span>', type: 'raw', delay: 1600 },
        { text: '<span class="t-blue">[nav] Iniciando barrido orbital sobre el Sector 3A para mapeo de daño foliar.</span>', type: 'raw', delay: 1000 },
        { text: '[ai] Segmentando hojas en busca de ninfas... Detección afirmativa.', type: 'info', delay: 1200 },
        { text: '[actuator] Aplicando dosis ultra-baja (ULV) de agente biológico. Duración: 3.5s', type: 'success', delay: 1500 },
        { text: '>> VUELO EN CURSO - Altitud: 12.5m | Velocidad: 1.5m/s | Batería: 81%', type: 'info', delay: 1000 },
        { text: '[cv2] Tratamiento completado. Reanudando trayectoria original de barrido.', type: 'info', delay: 900 },
        { text: '[gps] Coordinates: Lat -34.6045, Lng -58.3822 | Altitude: 15.0m', type: 'muted', delay: 1200 },
        { text: '[gps] Fin de ruta programada. Retornando a base (RTL)...', type: 'info', delay: 1000 },
        { text: '>> VUELO EN CURSO - Altitud: 15.0m | Velocidad: 5.5m/s | Batería: 78%', type: 'info', delay: 1000 },
        { text: '[sys] Aproximación a helipuerto de carga... Iniciando maniobra de precisión.', type: 'info', delay: 1200 },
        { text: '[sys] Altitud: 2.5m ... 1.0m ... 0.1m', type: 'muted', delay: 1500 },
        { text: '<span class="t-green">[SUCCESS] Aterrizaje autónomo exitoso. Conectando estación de recarga inductiva.</span>', type: 'raw', delay: 1000 },
        { text: '<span class="t-green">[SUCCESS] Misión de campo completada. Log exportado a /var/log/blobe/mission_0417.log</span>', type: 'raw', delay: 800 }
    ];

    // Iniciar o detener la telemetría
    btnStart.addEventListener('click', () => {
        if (!isRunning) {
            startSimulation();
        } else {
            stopSimulation();
        }
    });

    // Limpiar consola
    btnClear.addEventListener('click', () => {
        consoleContainer.innerHTML = '';
        btnClear.disabled = true;
        // Reiniciar la secuencia
        sequenceIndex = 0;
    });

    function startSimulation() {
        isRunning = true;
        btnStart.textContent = 'Detener Simulación';
        btnStart.classList.remove('btn-secondary');
        btnStart.classList.add('btn-primary');
        btnClear.disabled = true;
        
        statusIndicator.textContent = 'Ejecutando';
        statusIndicator.className = 'status-on';

        // Si la consola está vacía, restablecer o dar formato inicial
        if (consoleContainer.innerHTML === '') {
            consoleContainer.innerHTML = `<p class="terminal-line"><span class="t-green">pi@blobe-drone-edge</span>:<span class="t-blue">~</span>$ python3 blobe_inference_engine.py --mode autonomous</p>`;
        }

        // Ejecutar primer paso de telemetría
        runNextTelemetryLine();
    }

    function stopSimulation() {
        isRunning = false;
        btnStart.textContent = 'Iniciar Vuelo Simulado';
        btnStart.classList.remove('btn-primary');
        btnStart.classList.add('btn-secondary');
        btnClear.disabled = false;

        statusIndicator.textContent = 'Apagado';
        statusIndicator.className = 'status-off';

        if (telemetryTimeout) {
            clearTimeout(telemetryTimeout);
        }
    }

    function runNextTelemetryLine() {
        if (!isRunning) return;

        // Si ya terminamos la secuencia, detener la simulación o reiniciarla
        if (sequenceIndex >= telemetrySequence.length) {
            appendCommandLine('[sys] Sistema en reposo. Esperando nuevas directivas.');
            stopSimulation();
            sequenceIndex = 0; // Reiniciar para la próxima
            return;
        }

        const step = telemetrySequence[sequenceIndex];
        
        telemetryTimeout = setTimeout(() => {
            if (step.type === 'raw') {
                appendCommandLine(step.text);
            } else {
                let cssClass = 't-muted';
                if (step.type === 'info') cssClass = '';
                if (step.type === 'success') cssClass = 't-green';
                
                // Formatear línea estándar con fecha actual
                const timestamp = getFormattedTimestamp();
                const prefix = step.type === 'success' ? '[SUCCESS]' : '[INFO]';
                appendCommandLine(`<span class="${cssClass}">${prefix} ${timestamp} - ${step.text}</span>`);
            }
            
            sequenceIndex++;
            runNextTelemetryLine(); // Llamar recursivamente para la siguiente línea
        }, step.delay);
    }

    // Agrega una línea de comando y hace scroll automático
    function appendCommandLine(htmlContent) {
        const line = document.createElement('p');
        line.className = 'terminal-line';
        line.innerHTML = htmlContent;
        consoleContainer.appendChild(line);
        
        // Mantener cursor al final (removiéndolo si existía antes)
        const oldCursor = consoleContainer.querySelector('.terminal-cursor');
        if (oldCursor) oldCursor.remove();
        
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'terminal-cursor';
        consoleContainer.appendChild(cursorSpan);

        // Auto-scroll hacia abajo
        consoleContainer.scrollTop = consoleContainer.scrollHeight;
    }

    // Generar timestamp con formato YYYY-MM-DD HH:MM:SS
    function getFormattedTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
