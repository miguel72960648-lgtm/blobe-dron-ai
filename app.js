/**
 * Blobe - El Campo, Decodificado
 * Script de interactividad, efecto Parallax 3D, Consola Interactiva CLI y Sonidos/Cursor de Precisión
 */

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor(); // Inicializa el cursor de precisión
    initParallaxHero();
    initScrollReveal();
    initMobileMenu();
    initInteractiveConsole();
});

/* ==========================================================================
   0. Sonidos y Audio Context (Web Audio API - Sintetizador Local)
   ========================================================================== */
let audioCtx = null;

// Inicializa o retorna el contexto de audio (requiere interacción del usuario)
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Reproduce un sonido corto de tecla mecánica de alta precisión
function playKeySound() {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Sonido tipo click agudo con caída rápida
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
        console.warn("Audio Context bloqueado o no soportado:", e);
    }
}

// Reproduce un sonido de advertencia tipo sonar industrial (dos beeps cortos ascendentes)
function playWarningSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // Primer Beep
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(660, now);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc1.start(now);
        osc1.stop(now + 0.12);

        // Segundo Beep (desplazado en tiempo y con frecuencia más aguda)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.08);
        gain2.gain.setValueAtTime(0.08, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc2.start(now + 0.08);
        osc2.stop(now + 0.22);
    } catch (e) {
        console.warn("Audio Context bloqueado o no soportado:", e);
    }
}

/* ==========================================================================
   0.1. Cursor de Precisión Custom (Seguimiento y Detección)
   ========================================================================== */
function initCustomCursor() {
    // 1. Crear dinámicamente el elemento en el DOM
    const cursorEl = document.createElement('div');
    cursorEl.className = 'custom-cursor';
    cursorEl.id = 'customCursor';
    document.body.appendChild(cursorEl);

    // 2. Mover el cursor con el mouse
    window.addEventListener('mousemove', (e) => {
        cursorEl.style.left = `${e.clientX}px`;
        cursorEl.style.top = `${e.clientY}px`;
    }, { passive: true });

    // 3. Activar animación de escaneo al pasar sobre el dron o la consola
    const scanningTargets = document.querySelectorAll('.drone-sticky-container, .terminal-container');
    scanningTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursorEl.classList.add('scanning');
        });
        target.addEventListener('mouseleave', () => {
            cursorEl.classList.remove('scanning');
        });
    });
}

/* ==========================================================================
   1. Efecto Parallax del Hero (Optimizado con requestAnimationFrame)
   ========================================================================== */
function initParallaxHero() {
    const parallaxText = document.getElementById('parallaxText');
    if (!parallaxText) return;

    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight * 3;

        if (scrollY <= heroHeight) {
            const offset = scrollY * 0.35;
            parallaxText.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/* ==========================================================================
   2. Animaciones al hacer Scroll (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/* ==========================================================================
   3. Interactividad del Menú de Navegación
   ========================================================================== */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* ==========================================================================
   4. Consola Interactiva Tipo Linux (CLI en tiempo real)
   ========================================================================== */
function initInteractiveConsole() {
    const consoleContainer = document.getElementById('terminalConsole');
    const btnStart = document.getElementById('btnStartTelemetry');
    const btnClear = document.getElementById('btnClearTelemetry');
    const statusIndicator = document.getElementById('statusIndicator');
    const connBadge = document.getElementById('connBadge');

    if (!consoleContainer || !btnStart || !btnClear) return;

    let isLocked = false;

    // Crear e inyectar el input invisible
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.id = 'terminalHiddenInput';
    hiddenInput.autocomplete = 'off';
    hiddenInput.autocorrect = 'off';
    hiddenInput.autocapitalize = 'off';
    hiddenInput.spellcheck = false;
    
    Object.assign(hiddenInput.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '-1'
    });
    consoleContainer.appendChild(hiddenInput);

    // Mensaje inicial de la consola
    consoleContainer.innerHTML = `
        <p class="terminal-line t-muted">&gt; System initialized. Awaiting RF command link...</p>
        <p class="terminal-line t-muted">&gt; Escribe 'help' para ver los comandos disponibles.</p>
    `;
    consoleContainer.appendChild(hiddenInput);
    appendPromptLine();

    // Eventos de Foco
    consoleContainer.addEventListener('click', () => {
        if (!isLocked) {
            hiddenInput.focus();
            highlightCursor();
        }
    });

    hiddenInput.addEventListener('focus', highlightCursor);
    hiddenInput.addEventListener('blur', removeCursorHighlight);

    // Capturar la escritura (Activa sonido de teclado)
    hiddenInput.addEventListener('input', (e) => {
        if (isLocked) {
            hiddenInput.value = '';
            return;
        }
        
        const currentLineInputText = consoleContainer.querySelector('.current-prompt-line .input-text');
        if (currentLineInputText) {
            currentLineInputText.textContent = e.target.value;
        }
        autoScroll();
    });

    // Capturar teclas (Enter y clics de teclado)
    hiddenInput.addEventListener('keydown', async (e) => {
        if (isLocked) return;

        // Sonido de clic en teclas válidas de escritura
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
            playKeySound();
        }

        if (e.key === 'Enter') {
            const command = hiddenInput.value.trim().toLowerCase();
            hiddenInput.value = ''; // Limpiar el input

            finalizeCurrentPromptLine(command);

            if (command !== '') {
                await executeCommand(command);
            } else {
                appendPromptLine();
            }
        }
    });

    // Botones físicos
    btnStart.addEventListener('click', async () => {
        if (isLocked) return;
        
        playKeySound();
        const currentLineInputText = consoleContainer.querySelector('.current-prompt-line .input-text');
        if (currentLineInputText) {
            currentLineInputText.textContent = './start_yolo.sh';
        }
        finalizeCurrentPromptLine('./start_yolo.sh');
        await executeCommand('./start_yolo.sh');
    });

    btnClear.addEventListener('click', () => {
        if (isLocked) return;
        playKeySound();
        clearConsole();
    });

    /* --- Funciones de Lógica de Comandos --- */

    async function executeCommand(cmd) {
        switch (cmd) {
            case 'help':
                printOutput(`Comandos disponibles:
  status            Muestra el estado del dron y sensores de la Pi.
  clear             Limpia el historial de salida de la pantalla.
  ./start_yolo.sh   Ejecuta la IA de detección visual local.`);
                appendPromptLine();
                break;

            case 'status':
                printOutput(`[STATUS REPORT // BLOBE-EDGE]
--------------------------------------------------
Dron: STANDBY (Listo para despegue)
Batería: 88% (Voltaje nominal: 14.8V)
GPS: LOCK (12 satélites conectados, Precisión: 0.8m)
Cerebro: Raspberry Pi 5 (CPU Temp: 48°C)
Cámara: IMX500 Multiespectral (Estado: OK)
Inferencia: YOLOv8n_agri.onnx cargado`);
                appendPromptLine();
                break;

            case 'clear':
                clearConsole();
                break;

            case './start_yolo.sh':
                await runYoloSimulation();
                break;

            default:
                printOutput(`<span class="t-red">bash: ${escapeHTML(cmd)}: command not found. Escribe 'help' para opciones.</span>`, true);
                appendPromptLine();
                break;
        }
    }

    // Simulación progresiva usando Async/Await con avisos sonoros
    async function runYoloSimulation() {
        lockInput(true);
        
        statusIndicator.textContent = 'RUNNING';
        statusIndicator.className = 'status-on';
        
        connBadge.textContent = 'CONNECTED';
        connBadge.classList.add('connected');

        await delay(800);
        printOutput('[SYS] Mount multiespectral camera... OK');
        
        await delay(600);
        printOutput('[SYS] Connecting flight controller ROS 2 nodes... OK');

        await delay(700);
        printOutput('[AI] Loading YOLOv8n weights into RAM... 412ms');

        await delay(600);
        printOutput('[AI] Model loaded on NPU. Warm-up successful.', 'success');

        await delay(1000);
        printOutput('[CV] Processing frames at 30fps...');

        await delay(1200);
        printOutput('<span class="t-yellow">[WARN] Estrés hídrico detectado. Recalculando ruta...</span>', true);
        playWarningSound(); // Alerta auditiva sintética

        await delay(1000);
        printOutput('<span class="t-blue">[NAV] Ajustando yaw/pitch y ralentizando vuelo a 2m/s.</span>', true);

        await delay(1300);
        printOutput('[ACTUATOR] Activando válvula solenoide de pulverización focalizada', 'success');

        await delay(1500);
        printOutput('[ACTUATOR] Pulverización completada en zona afectada.');

        await delay(1000);
        printOutput('>> MISSION COMPLETE. Returning to Launch (RTL).');

        await delay(800);
        printOutput('<span class="t-green">[SUCCESS] Aterrizaje autónomo seguro. Log guardado en /var/log/blobe/yolo.log</span>', true);

        lockInput(false);
        appendPromptLine();
    }

    /* --- Helpers de la Terminal --- */

    function appendPromptLine() {
        consoleContainer.appendChild(hiddenInput);
        hiddenInput.value = '';

        const line = document.createElement('p');
        line.className = 'terminal-line current-prompt-line';
        line.innerHTML = `<span class="t-green">pi@blobe-edge</span>:<span class="t-blue">~</span>$ <span class="input-text"></span><span class="terminal-cursor"></span>`;
        consoleContainer.appendChild(line);
        
        if (document.activeElement === hiddenInput) {
            highlightCursor();
        }
        autoScroll();
    }

    function finalizeCurrentPromptLine(enteredText) {
        const currentLine = consoleContainer.querySelector('.current-prompt-line');
        if (currentLine) {
            currentLine.innerHTML = `<span class="t-green">pi@blobe-edge</span>:<span class="t-blue">~</span>$ <span class="t-white">${escapeHTML(enteredText)}</span>`;
            currentLine.classList.remove('current-prompt-line');
        }
    }

    function printOutput(text, isHTML = false) {
        const line = document.createElement('p');
        line.className = 'terminal-line';
        
        if (isHTML) {
            line.innerHTML = `&gt; ${text}`;
        } else {
            const formattedText = escapeHTML(text).replace(/\n/g, '<br>');
            line.innerHTML = `&gt; ${formattedText}`;
        }
        
        consoleContainer.appendChild(line);
        autoScroll();
    }

    function clearConsole() {
        consoleContainer.innerHTML = '';
        consoleContainer.appendChild(hiddenInput);
        appendPromptLine();
        btnClear.disabled = true;
    }

    function lockInput(lock) {
        isLocked = lock;
        if (lock) {
            hiddenInput.blur();
            btnStart.disabled = true;
            btnClear.disabled = true;
        } else {
            btnStart.disabled = false;
            btnClear.disabled = false;
            
            statusIndicator.textContent = 'STANDBY';
            statusIndicator.className = 'status-off';
            
            connBadge.textContent = 'DISCONNECTED';
            connBadge.classList.remove('connected');
            
            hiddenInput.focus();
        }
    }

    function highlightCursor() {
        const cursor = consoleContainer.querySelector('.current-prompt-line .terminal-cursor');
        if (cursor) {
            cursor.style.display = 'inline-block';
        }
    }

    function removeCursorHighlight() {
        const cursor = consoleContainer.querySelector('.current-prompt-line .terminal-cursor');
        if (cursor) {
            cursor.style.display = 'none';
        }
    }

    function autoScroll() {
        consoleContainer.scrollTop = consoleContainer.scrollHeight;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}
