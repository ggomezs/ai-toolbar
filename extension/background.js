// background.js
// Service Worker central de la extensión.
// Gestiona la comunicacion hacia el servidor local (FastAPI).

const BACKEND_URL = "http://localhost:8000/log";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "LOG_PROMPT") {
        console.log("[Background SW] Recibido payload para ser guardado:", request.payload);

        // Enviar al Backend mediante POST
        fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.payload)
        })
            .then(response => {
                if (!response.ok) {
                    console.warn("[Background SW] Error en servidor local: HTTP", response.status);
                    // Aquí en el futuro se podrian guardar en chrome.storage en caso de fallo
                } else {
                    console.log("[Background SW] Payload persistido correctamente en backend local.");
                }
            })
            .catch(err => {
                console.error("[Background SW] Falló conexión al backend en " + BACKEND_URL + ".", err);
                // Igualmente, candidato para encolamiento offline si backend offline.
            });

        return true;  // Indica respuesta asincrona permitida
    }
});
