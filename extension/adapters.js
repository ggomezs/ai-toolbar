// adapters.js
// Contiene la lógica para extraer los prompts de diferentes proveedores de IA

const adapters = {
  // Regex para identificar peticiones a OpenAI Web
  matchers: [
    {
      provider: "OpenAI",
      urlRegex: /chatgpt\.com\/backend-(api|anon)(\/[a-zA-Z0-9_-]+)*\/conversation/i,
      extract: (requestData) => {
        try {
          const body = JSON.parse(requestData.body);

          let rawPrompt = "Unknown prompt structure";
          let model = body.model || "unknown";

          // Buscar el mensaje del usuario en el array

          if (body.messages && Array.isArray(body.messages)) {
            const userMessage = body.messages.find(m => m.author && m.author.role === 'user');
            if (userMessage && userMessage.content && userMessage.content.parts) {
              rawPrompt = userMessage.content.parts.join(" ");
            }
          }

          if (rawPrompt !== "Unknown prompt structure") {
            return {
              provider: "OpenAI",
              model: model,
              raw_prompt: rawPrompt,
              timestamp: new Date().toISOString()
            };
          } else {
            console.log("[Shadow Logger] Atencion: La estructura del prompt es desconocida en esta peticion. Body de messages:");
            console.log(body.messages);
          }
        } catch (e) {
          console.error("[Shadow Logger] Error parsing OpenAI payload:", e.message);
          console.error("Payload original:", requestData.body);
        }
        return null;
      }
    }
  ],

  // Función principal para procesar una request capturada
  processRequest: function (url, requestBody) {
    for (const matcher of this.matchers) {
      if (matcher.urlRegex.test(url)) {
        console.log(`[Shadow Logger] Match found for ${matcher.provider}:`, url);
        return matcher.extract({ url, body: requestBody });
      }
    }
    return null;
  }
};

// Necesario exportarlo si se carga como modulo o inyectado directamente
window.AI_ADAPTERS = adapters;
