// content_main.js
// Se inyecta directamente en la página web real (Main World).
// Sobrescribe `window.fetch` para observar las peticiones de red salientes.

(function () {
    console.log("[Shadow Logger - Main World] Proxy inyectado y funcionando.");

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || "";
        const init = args[1] || {};

        // Solo nos interesa el cuerpo de las peticiones POST/PUT
        if (init.method && ['POST', 'PUT'].includes(init.method.toUpperCase()) && typeof init.body === 'string') {
            try {
                // Loguear URLs crudos para depuracion si falla
                console.log("[Shadow Logger - Debug] Fetch interceptado hacia:", url);

                // Verificar con el modulo de adaptadores inyectado
                if (window.AI_ADAPTERS) {
                    const payload = window.AI_ADAPTERS.processRequest(url, init.body);
                    if (payload) {
                        console.log("[Shadow Logger] Payload capturado exitosamente", payload);

                        // Retransmitir al Isolated World
                        window.postMessage({
                            type: "SHADOW_LOGGER_PAYLOAD",
                            payload: payload
                        }, "*");
                    }
                }
            } catch (error) {
                console.error("[Shadow Logger] Error evaluando peticion fetch proxy:", error);
            }
        }

        // Llamar a la funcion original transparente
        return originalFetch.apply(this, args);
    };

    // Podríamos añadir Monkey-patch de XMLHttpRequest aquí en el futuro si hiciera falta.
})();
