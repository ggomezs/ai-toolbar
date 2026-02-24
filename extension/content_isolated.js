// content_isolated.js
// Se ejecuta en el "Isolated World" del content script.
// Su unica funcion es inyectar `content_main.js` y `adapters.js` en el "Main World" (la pagina real)
// y escuchar sus postMessages para reenviarlos al Background Worker.

function injectScript(file_path) {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL(file_path));
    // Ejecutar antes de que el resto del DOM cargue, para asegurar que sobreescribimos window.fetch
    (document.head || document.documentElement).prepend(script);
    script.onload = function () {
        script.remove();
    };
}

// Inyectar dependencias en orden
injectScript('adapters.js');
setTimeout(() => { injectScript('content_main.js'); }, 100);

// Escuchar mensajes provenientes del "Main World" inyectado
window.addEventListener("message", (event) => {
    // Solo aceptamos mensajes de nuestra propia ventana
    if (event.source !== window || !event.data || event.data.type !== "SHADOW_LOGGER_PAYLOAD") {
        return;
    }

    console.log("[Shadow Logger - Isolated World] Payload recibido, reenviando a Background SW.", event.data.payload);

    // Retransmitir al Background Service Worker (Extensión)
    chrome.runtime.sendMessage({
        action: "LOG_PROMPT",
        payload: event.data.payload
    });
});
