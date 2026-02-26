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
    },
    {
      provider: "Google Gemini",
      urlRegex: /(_\/BardChatUi\/data\/batchexecute|assistant\.lamda\.BardFrontendService\/StreamGenerate|\$rpc\/.*\/Chat)/i,
      extract: (requestData) => {
        try {
          // Filtrar ruido obvio
          if (!requestData.url.includes("batchexecute") && !requestData.url.includes("StreamGenerate") && !requestData.url.includes("$rpc") && !requestData.url.includes("Chat")) {
            return null;
          }

          console.log(`[Shadow Logger - Gemini Debug] Analizando URL candidata: ${requestData.url}`);

          const bodyText = typeof requestData.body === 'string' ? requestData.body : "";
          if (!bodyText) {
            console.log("[Shadow Logger - Gemini Debug] Body vacio o no es string.");
            return null;
          }

          let rawPrompt = "Unknown Gemini prompt structure";
          let hasAttachments = false;
          let fileNames = [];

          // Gemini payloads often come as x-www-form-urlencoded in 'f.req'
          let payloadStr = bodyText;
          if (bodyText.includes('f.req=')) {
            const params = new URLSearchParams(bodyText);
            payloadStr = params.get('f.req') || '';
            console.log("[Shadow Logger - Gemini Debug] Payload f.req extraido:", payloadStr.substring(0, 100) + "...");
          }

          if (!payloadStr) return null;

          // Función recursiva explícitamente SOLO para buscar metadata de adjuntos.
          // IGNORA TEXTOS PARA NO ATRAPAR IDs O CÓDIGO DE TELEMETRÍA POR ERROR.
          function inspectArray(arr) {
            for (const item of arr) {
              if (typeof item === 'string') {
                // Detectar posibles adjuntos por firmas de Google o extensiones de archivo
                if (item.includes('/contrib_service/') || item.includes('mime_type') || item.match(/\.(pdf|txt|png|jpg|jpeg|docx|csv|xlsx)$/i)) {
                  hasAttachments = true;
                  // Si parece un nombre de archivo, lo guardamos
                  if (item.match(/\.[a-zA-Z0-9]{3,4}$/i) && item.length < 100 && !item.includes('/')) {
                    fileNames.push(item);
                  }
                }
              } else if (Array.isArray(item)) {
                inspectArray(item);
              } else if (item && typeof item === 'object') {
                inspectArray(Object.values(item));
              }
            }
          }

          // Parse JSON if possible
          try {
            const parsed = JSON.parse(payloadStr);
            let innerStr = null;

            // Filtro de ruido agresivo: Ignorar peticiones de keep-alive o de background explícitas
            if (payloadStr.includes('"bard_activity_enabled"') || payloadStr.includes('music_generation_soft')) {
              return null; // Silenciar petición entera
            }

            // batchexecute: [ [ [ "rpcid", "INNER_JSON", ... ] ] ]
            if (requestData.url.includes("batchexecute") && Array.isArray(parsed) && Array.isArray(parsed[0]) && Array.isArray(parsed[0][0]) && typeof parsed[0][0][1] === 'string') {
              innerStr = parsed[0][0][1];
            }
            // StreamGenerate: [ null, "INNER_JSON" ]
            else if (requestData.url.includes("StreamGenerate") && Array.isArray(parsed) && typeof parsed[1] === 'string') {
              innerStr = parsed[1];
            } else if (Array.isArray(parsed) && typeof parsed[1] === 'string') {
              // Fallback default structure
              innerStr = parsed[1];
            }

            if (innerStr) {
              const innerParsed = JSON.parse(innerStr);

              rawPrompt = ""; // Resetear para inspección estricta

              // BÚSQUEDA EXPLÍCITA DEL PROMPT:
              // Los prompts de usuario en Gemini se ubican en rutas precisas, ej: innerParsed[0][0] o innerParsed[0][0][0]
              let potentialText = null;

              if (Array.isArray(innerParsed) && innerParsed.length > 0) {
                // Variación 1: [[[ "El prompt", 0, null, [] ], ... ]]
                if (Array.isArray(innerParsed[0]) && Array.isArray(innerParsed[0][0]) && typeof innerParsed[0][0][0] === 'string') {
                  if (innerParsed[0][0].length > 1) { // A real prompt array has more than just the string
                    potentialText = innerParsed[0][0][0];
                  }
                }
                // Variación 2: [[ "El prompt", 0, null, [] ], ... ]
                else if (Array.isArray(innerParsed[0]) && typeof innerParsed[0][0] === 'string') {
                  if (innerParsed[0].length > 1) {
                    potentialText = innerParsed[0][0];
                  }
                }
                // Variación 3: [[ null, "El prompt", ... ]]
                else if (Array.isArray(innerParsed[0]) && innerParsed[0][0] === null && typeof innerParsed[0][1] === 'string') {
                  potentialText = innerParsed[0][1];
                }
                // Variación 4: [ null, "El prompt", ... ]
                else if (innerParsed[0] === null && typeof innerParsed[1] === 'string') {
                  potentialText = innerParsed[1];
                }
              }

              // Validar que el texto encontrado parezca un prompt real y no una key/id interno
              if (potentialText && potentialText.trim() !== "") {
                // Si no tiene espacios y usa guiones bajos o es muy largo sin sentido, probablemente es telemetría
                let isTelemetryId = !potentialText.includes(' ') && (potentialText.includes('_') || potentialText.length > 30 || potentialText === "me");

                if (!isTelemetryId) {
                  rawPrompt = potentialText;
                }
              }

              // Recorremos todo el árbol SÓLO para buscar metadata de adjuntos
              inspectArray(innerParsed);
            }
          } catch (e) {
            console.log("[Shadow Logger - Gemini Debug] Error profundo analizando JSON o ofuscación encontrada:", e.message);
          }

          // Si sólo subió un archivo sin texto, el prompt suele estar vacío (o ser sólo comillas)
          if (!rawPrompt || rawPrompt.trim() === "" || rawPrompt === "Unknown Gemini prompt structure") {
            if (hasAttachments) {
              rawPrompt = "[Attachment Only Upload]";
            } else {
              rawPrompt = "Unknown Gemini prompt structure";
            }
          }

          if (rawPrompt !== "Unknown Gemini prompt structure") {
            let finalPrompt = rawPrompt.trim();
            if (hasAttachments && fileNames.length > 0) {
              const uniqueFiles = [...new Set(fileNames)];
              finalPrompt += `\n[Attachments: ${uniqueFiles.join(', ')}]`;
            } else if (hasAttachments) {
              finalPrompt += `\n[Attachments: Unnamed File(s)]`;
            }

            console.log("[Shadow Logger - Gemini Debug] ¡PROMPT EXTRAIDO EXITO!", finalPrompt);
            return {
              provider: "Google Gemini",
              model: "gemini",
              raw_prompt: finalPrompt,
              timestamp: new Date().toISOString(),
              has_attachments: hasAttachments
            };
          } else {
            console.log("[Shadow Logger - Gemini Debug] No se pudo extraer el prompt del payload. Estructura no reconocida.");
          }
        } catch (e) {
          console.error("[Shadow Logger] Error parsing Gemini payload:", e.message);
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
