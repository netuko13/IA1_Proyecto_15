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
    // Convert input to lowercase for case-insensitive matching
    const normalizedInput = input.toLowerCase().trim();

    // First, check for exact intent matches
    for (const intent of this.intents) {
      if (
        intent.patterns.some((pattern) => normalizedInput.includes(pattern))
      ) {
        return this.getRandomResponse(intent.responses);
      }
    }

    // If no match, return a fallback response
    return this.getRandomResponse(this.fallbackResponses);
  }

  getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  }
}
