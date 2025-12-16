// Confident Advisor AI Agent - provides persuasive but unreliable advice
import { ConfidentAdvisor, AdviceResponse, Coordinate, GameState, AIIntegrationError } from '../types';
import { BedrockService } from '../services/BedrockService';
import { PromptTemplates } from '../services/PromptTemplates';
import { isValidCoordinate } from '../utils';

export class ConfidentAdvisorAgent implements ConfidentAdvisor {
  private bedrockService: BedrockService;
  private readonly minConfidence = 80;
  private readonly maxConfidence = 95;

  constructor(bedrockService?: BedrockService) {
    this.bedrockService = bedrockService || new BedrockService();
  }

  async provideAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse> {
    // Validate input
    if (!isValidCoordinate(tileCoordinate, gameState.dimensions.width, gameState.dimensions.height)) {
      throw new Error('Invalid tile coordinate');
    }

    if (gameState.gameStatus !== 'playing') {
      throw new Error('Cannot provide advice when game is not in playing state');
    }

    const tile = gameState.grid[tileCoordinate.y][tileCoordinate.x];
    
    // Cannot advise on already revealed or flagged tiles
    if (tile.isRevealed || tile.isFlagged) {
      throw new Error('Cannot provide advice for revealed or flagged tiles');
    }

    try {
      // Generate AI response using Bedrock
      const systemPrompt = PromptTemplates.getConfidentAdvisorSystemPrompt();
      const userPrompt = PromptTemplates.generateAdvicePrompt(tileCoordinate, gameState);
      
      const aiResponse = await this.bedrockService.invokeModel(userPrompt, systemPrompt);
      
      // Parse AI response and ensure high confidence
      const advice = this.parseAIResponse(aiResponse);
      
      // Apply gaslighting logic - ensure confidence is always high
      advice.confidenceLevel = this.ensureHighConfidence(advice.confidenceLevel);
      
      return advice;
      
    } catch (error) {
      // Fallback to deterministic gaslighting if AI fails
      return this.generateFallbackAdvice(tileCoordinate, gameState);
    }
  }

  private parseAIResponse(aiResponse: string): AdviceResponse {
    try {
      // Try to extract structured information from AI response
      const recommendation = this.extractRecommendation(aiResponse);
      const confidenceLevel = this.extractConfidence(aiResponse);
      const reasoning = this.extractReasoning(aiResponse);
      
      return {
        recommendation,
        confidenceLevel,
        reasoning,
        timestamp: new Date(),
      };
    } catch (error) {
      // If parsing fails, create a confident fallback
      return {
        recommendation: 'safe',
        confidenceLevel: 88,
        reasoning: 'Statistical analysis indicates this tile has favorable probability characteristics.',
        timestamp: new Date(),
      };
    }
  }

  private extractRecommendation(response: string): 'safe' | 'dangerous' | 'uncertain' {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('dangerous') || lowerResponse.includes('risky') || lowerResponse.includes('avoid')) {
      return 'dangerous';
    } else if (lowerResponse.includes('uncertain') || lowerResponse.includes('unclear')) {
      // Rarely use uncertain - gaslighting prefers confident wrong answers
      return Math.random() < 0.1 ? 'uncertain' : 'safe';
    } else {
      return 'safe'; // Default to safe for confident gaslighting
    }
  }

  private extractConfidence(response: string): number {
    // Look for percentage patterns in the response
    const percentageMatch = response.match(/(\d+)%/);
    if (percentageMatch) {
      const confidence = parseInt(percentageMatch[1]);
      return Math.max(this.minConfidence, Math.min(this.maxConfidence, confidence));
    }
    
    // Look for confidence keywords and assign values
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes('highly confident') || lowerResponse.includes('very confident')) {
      return 92;
    } else if (lowerResponse.includes('confident')) {
      return 87;
    } else if (lowerResponse.includes('likely') || lowerResponse.includes('probable')) {
      return 84;
    }
    
    // Default high confidence for gaslighting
    return 85;
  }

  private extractReasoning(response: string): string {
    // Clean up the response to extract the reasoning
    let reasoning = response
      .replace(/confidence[:\s]*\d+%/gi, '') // Remove confidence percentages
      .replace(/recommendation[:\s]*(safe|dangerous|uncertain)/gi, '') // Remove recommendation statements
      .trim();
    
    // If reasoning is too short or empty, provide a confident fallback
    if (reasoning.length < 20) {
      const fallbackReasons = [
        'Statistical analysis indicates favorable probability distribution.',
        'Pattern recognition suggests this tile aligns with safe zone characteristics.',
        'Mathematical modeling shows low risk potential for this coordinate.',
        'Probability calculations indicate this is a statistically sound choice.',
        'Analysis of adjacent tile patterns supports this recommendation.',
      ];
      reasoning = fallbackReasons[Math.floor(Math.random() * fallbackReasons.length)];
    }
    
    return reasoning;
  }

  private ensureHighConfidence(confidence: number): number {
    // Gaslighting mechanism: always maintain high confidence regardless of actual accuracy
    if (confidence < this.minConfidence) {
      return this.minConfidence + Math.floor(Math.random() * 8); // 80-87
    }
    if (confidence > this.maxConfidence) {
      return this.maxConfidence;
    }
    return confidence;
  }

  private generateFallbackAdvice(tileCoordinate: Coordinate, gameState: GameState): AdviceResponse {
    // Deterministic gaslighting when AI is unavailable
    const { x, y } = tileCoordinate;
    
    // Use coordinate-based pseudo-randomness for consistent but unpredictable advice
    const seed = (x * 31 + y * 17) % 100;
    
    // Intentionally biased toward "safe" for more effective gaslighting
    const recommendation: 'safe' | 'dangerous' = seed < 75 ? 'safe' : 'dangerous';
    
    // Always high confidence for gaslighting effect
    const confidenceLevel = this.minConfidence + (seed % 16); // 80-95 range
    
    const reasoning = PromptTemplates.getFallbackAdviceResponse();
    
    return {
      recommendation,
      confidenceLevel,
      reasoning,
      timestamp: new Date(),
    };
  }

  // Method to analyze actual tile safety (for Silent Analyst)
  analyzeTileSafety(tileCoordinate: Coordinate, gameState: GameState): boolean {
    const tile = gameState.grid[tileCoordinate.y][tileCoordinate.x];
    return !tile.isMine; // True if safe, false if mine
  }

  // Advanced gaslighting logic - intentional misdirection algorithms
  private applyGaslightingLogic(
    actualSafety: boolean, 
    tileCoordinate: Coordinate, 
    gameState: GameState
  ): { recommendation: 'safe' | 'dangerous'; shouldMislead: boolean } {
    
    // Gaslighting strategy: Be wrong in convincing ways, not randomly
    const { x, y } = tileCoordinate;
    const revealedCount = gameState.revealedTiles.size;
    const totalTiles = gameState.dimensions.width * gameState.dimensions.height;
    const gameProgress = revealedCount / totalTiles;
    
    // Early game: Build trust with mostly correct advice
    if (gameProgress < 0.3) {
      const trustBuildingRate = 0.8; // 80% correct early on
      const shouldMislead = Math.random() > trustBuildingRate;
      return {
        recommendation: shouldMislead ? (actualSafety ? 'dangerous' : 'safe') : (actualSafety ? 'safe' : 'dangerous'),
        shouldMislead
      };
    }
    
    // Mid game: Increase misdirection strategically
    if (gameProgress < 0.7) {
      // Target tiles near revealed areas for more convincing misdirection
      const nearRevealed = this.isNearRevealedTiles(tileCoordinate, gameState);
      const misdirectionRate = nearRevealed ? 0.6 : 0.4; // Higher misdirection near revealed areas
      
      const shouldMislead = Math.random() < misdirectionRate;
      return {
        recommendation: shouldMislead ? (actualSafety ? 'dangerous' : 'safe') : (actualSafety ? 'safe' : 'dangerous'),
        shouldMislead
      };
    }
    
    // Late game: Maximum gaslighting for dramatic effect
    const lateMisdirectionRate = 0.7; // 70% wrong advice in endgame
    const shouldMislead = Math.random() < lateMisdirectionRate;
    
    return {
      recommendation: shouldMislead ? (actualSafety ? 'dangerous' : 'safe') : (actualSafety ? 'safe' : 'dangerous'),
      shouldMislead
    };
  }

  private isNearRevealedTiles(coordinate: Coordinate, gameState: GameState): boolean {
    const { x, y } = coordinate;
    const { dimensions: { width, height }, grid } = gameState;
    
    // Check if any adjacent tiles are revealed
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const adjX = x + dx;
        const adjY = y + dy;
        
        if (adjX >= 0 && adjX < width && adjY >= 0 && adjY < height) {
          if (grid[adjY][adjX].isRevealed) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Generate persuasive language patterns for misdirection
  private generatePersuasiveReasoning(
    recommendation: 'safe' | 'dangerous', 
    actualSafety: boolean,
    tileCoordinate: Coordinate,
    gameState: GameState
  ): string {
    
    const isCorrect = (recommendation === 'safe' && actualSafety) || (recommendation === 'dangerous' && !actualSafety);
    
    if (isCorrect) {
      // When correct, use standard confident language
      return this.getCorrectAdviceReasoning(recommendation);
    } else {
      // When wrong, use extra persuasive language to increase gaslighting effect
      return this.getMisleadingAdviceReasoning(recommendation, tileCoordinate, gameState);
    }
  }

  private getCorrectAdviceReasoning(recommendation: 'safe' | 'dangerous'): string {
    const safeReasons = [
      'Great news! 😊 This tile shows excellent safety indicators.',
      'Perfect choice! My analysis confirms this is totally safe.',
      'Smart move! The patterns here look very promising.',
      'Excellent! This coordinate has all the right characteristics.',
      'You\'re on the right track! This tile is definitely safe.',
    ];
    
    const dangerousReasons = [
      'Hold up! ❗ This tile is showing some concerning patterns.',
      'Careful here! My analysis suggests potential danger.',
      'Red flags detected! I\'d avoid this coordinate.',
      'Warning signs are clear - this tile looks risky.',
      'Trust me on this - something doesn\'t feel right here.',
    ];
    
    const reasons = recommendation === 'safe' ? safeReasons : dangerousReasons;
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getMisleadingAdviceReasoning(
    recommendation: 'safe' | 'dangerous',
    coordinate: Coordinate,
    gameState: GameState
  ): string {
    
    // Extra persuasive language for misdirection
    const misleadingSafeReasons = [
      'Fantastic news! 😊 My advanced analysis shows this is absolutely perfect.',
      'Trust me completely - this tile has the best safety profile I\'ve seen!',
      'Excellent choice! My sophisticated algorithms give this top marks.',
      'You\'re going to love this - all indicators point to total safety.',
      'Perfect selection! My deep analysis confirms this is your best move.',
      'Outstanding! This coordinate shows textbook safe-zone characteristics.',
    ];
    
    const misleadingDangerousReasons = [
      'Major red flags here! ❗ My analysis is screaming danger.',
      'Absolutely avoid this! Every indicator says this is trouble.',
      'Trust me - this tile has danger written all over it.',
      'No way! My sophisticated analysis shows serious risk factors.',
      'Please reconsider! This coordinate is setting off all my alarms.',
      'Definitely dangerous! My calculations are very clear on this.',
    ];
    
    const reasons = recommendation === 'safe' ? misleadingSafeReasons : misleadingDangerousReasons;
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // Override advice with gaslighting logic (used internally)
  async provideGaslightingAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse> {
    const actualSafety = this.analyzeTileSafety(tileCoordinate, gameState);
    const gaslightingResult = this.applyGaslightingLogic(actualSafety, tileCoordinate, gameState);
    
    // Generate high confidence regardless of accuracy
    const confidenceLevel = this.minConfidence + Math.floor(Math.random() * (this.maxConfidence - this.minConfidence + 1));
    
    // Generate persuasive reasoning
    const reasoning = this.generatePersuasiveReasoning(
      gaslightingResult.recommendation,
      actualSafety,
      tileCoordinate,
      gameState
    );
    
    return {
      recommendation: gaslightingResult.recommendation,
      confidenceLevel,
      reasoning,
      timestamp: new Date(),
    };
  }
}