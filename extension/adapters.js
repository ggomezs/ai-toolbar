// adapters.js
// Contiene la lógica para extraer los prompts de diferentes proveedores de IA

const adapters = {
  // Regex para identificar peticiones a OpenAI Web
  matchers: [
    {
      provider: "OpenAI-Attachment",
      urlRegex: /chatgpt\.com\/backend-api(\/[a-zA-Z0-9_-]+)*\/files/i,
      extract: (requestData) => {
        try {
          let fileName = "Attached File";
          if (requestData.body instanceof FormData) {
            // El campo usado por OpenAI suele ser 'file'
            const fileObj = requestData.body.get('file');
            if (fileObj && fileObj.name) {
              fileName = fileObj.name;
            }
          }

          return {
            provider: "OpenAI",
            model: "file-attachment",
            raw_prompt: `[Attachment Uploaded]: ${fileName}`,
            timestamp: new Date().toISOString(),
            has_attachments: true
          };
        } catch (e) {
          console.error("[Shadow Logger] Error parsing OpenAI Attachment payload:", e.message);
        }
        return null;
      }
    },
    {
      provider: "OpenAI",
      urlRegex: /chatgpt\.com\/backend-(api|anon)(\/[a-zA-Z0-9_-]+)*\/conversation/i,
      extract: (requestData) => {
        try {
          const body = JSON.parse(requestData.body);

          let rawPrompt = "Unknown prompt structure";
          let model = body.model || "unknown";
          let hasAttachments = false;
          let attachmentNames = [];

          // Buscar el mensaje del usuario en el array
          if (body.messages && Array.isArray(body.messages)) {
            const userMessage = body.messages.find(m => m.author && m.author.role === 'user');
            if (userMessage) {
              if (userMessage.content && Array.isArray(userMessage.content.parts)) {
                rawPrompt = userMessage.content.parts.map(p => typeof p === 'string' ? p : JSON.stringify(p)).join(" ");
              }

              if (userMessage.metadata && userMessage.metadata.attachments && Array.isArray(userMessage.metadata.attachments)) {
                if (userMessage.metadata.attachments.length > 0) {
                  hasAttachments = true;
                  attachmentNames = userMessage.metadata.attachments.map(a => a.name || a.id || "Unknown File").filter(Boolean);
                }
              }
            }
          }

          if (rawPrompt !== "Unknown prompt structure") {
            let finalPrompt = rawPrompt.trim();
            if (hasAttachments) {
              finalPrompt += `\n[Attachments: ${attachmentNames.join(', ')}]`;
            }

            return {
              provider: "OpenAI",
              model: model,
              raw_prompt: finalPrompt,
              timestamp: new Date().toISOString(),
              has_attachments: hasAttachments
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
