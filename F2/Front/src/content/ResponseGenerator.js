// Enhanced Response Generation System
export class ResponseGenerator {
  constructor() {
    this.intents = [];

    this.fallbackResponses = [
      "That's an interesting topic! I'm processing your request and will do my best to provide a helpful response.",
      "I'm intrigued by your query. Give me a moment to formulate a comprehensive answer.",
      "Hmm, let me think about that and provide you with the most accurate information I can.",
      "Great question! Let me dig into my knowledge base and craft a detailed response for you.",
      "I'm analyzing your input to provide the most relevant and helpful information possible.",
    ];
    // Llamar a loadIntents() automáticamente al crear la instancia
    this.loadIntents();
  }
  async loadIntents() {
    try {
      const response = await fetch('/intents.json');
      const data = await response.json();
      this.intents = data;
      console.log('Intents loaded successfully', this.intents);
    }
    catch (error) {
      console.error('Error loading intents:', error);

    }
  }
  findBestMatch(input) {
    // Normalize input: lowercase, trim, remove punctuation
    const normalizedInput = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/gi, ''); // Elimina signos de puntuación

    let bestMatch = null;
    let highestScore = 0;

    // Escapar caracteres especiales en el patrón
    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapa caracteres especiales

    // Check for the best match among all intents
    for (const intent of this.intents) {
      for (const pattern of intent.patterns) {
        const escapedPattern = escapeRegExp(pattern); // Escapa el patrón
        const regex = new RegExp(`\\b${escapedPattern}\\b`, 'i'); // Word boundaries and case-insensitive

        if (regex.test(normalizedInput)) {
          const score = pattern.length; // Score based on pattern length
          if (score > highestScore) {
            bestMatch = intent;
            highestScore = score;
          }
        }
      }
    }

    // Return the response for the best matching intent
    if (bestMatch) {
      return this.getRandomResponse(bestMatch.responses);
    }

    // If no match, return a fallback response
    return this.getRandomResponse(this.fallbackResponses);
  }

  getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }
}
