// content_main.js
// Se inyecta directamente en la página web real (Main World).
// Sobrescribe `window.fetch` para observar las peticiones de red salientes.

(function () {
    console.log("[Shadow Logger - Main World] Proxy inyectado y funcionando.");

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || "";
        const init = args[1] || {};

        // Nos interesan peticiones POST/PUT, ya sean de texto o subidas de archivos (FormData)
        if (init.method && ['POST', 'PUT'].includes(init.method.toUpperCase())) {
            const isString = typeof init.body === 'string';
            const isFormData = init.body instanceof FormData;

            if (isString || isFormData) {
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
        }

        // Llamar a la funcion original transparente
        return originalFetch.apply(this, args);
    };

    // Monkey-patch de XMLHttpRequest para soportar Gemini y sistemas Legacy
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = typeof url === 'string' ? url : (url && url.href) || "";
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        try {
            if (this._method && ['POST', 'PUT'].includes(this._method.toUpperCase())) {
                const isString = typeof body === 'string';
                const isFormData = body instanceof FormData;

                if (isString || isFormData) {
                    // Loguear URLs crudos para depuracion si falla
                    console.log("[Shadow Logger - Debug] XHR interceptado hacia:", this._url);

                    if (window.AI_ADAPTERS) {
                        const payload = window.AI_ADAPTERS.processRequest(this._url, body);
                        if (payload) {
                            console.log("[Shadow Logger] Payload capturado exitosamente (XHR)", payload);
                            window.postMessage({
                                type: "SHADOW_LOGGER_PAYLOAD",
                                payload: payload
                            }, "*");
                        }
                    }
                }
            }
        } catch (error) {
            console.error("[Shadow Logger] Error evaluando peticion XHR proxy:", error);
        }
        return originalXhrSend.apply(this, arguments);
    };
})();
