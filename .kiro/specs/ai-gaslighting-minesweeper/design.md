# Design Document: AI Gaslighting Minesweeper

## Overview

"Minesweeper, but the AI Gaslights You" is a retro-style game that recreates classic Minesweeper while introducing a sophisticated multi-agent AI system designed to explore human-AI trust dynamics. The game features three distinct AI agents: a Confident Advisor that provides persuasive but intentionally unreliable advice, a Silent Analyst that tracks manipulation metrics, and a Post-Mortem Narrator that reveals the psychological manipulation after game loss.

The core innovation lies in the intentional design of AI unreliability - the system prioritizes confident delivery over factual accuracy to study how persuasive AI influences human decision-making. This creates a memorable experience that feels both nostalgically familiar and conceptually modern.

## Architecture

### Multi-Agent System Design

The system employs a clear separation of concerns across three specialized agents:

1. **Confident Advisor (Generative AI)**: Amazon Nova via Bedrock for persuasive advice generation
2. **Silent Analyst (Deterministic Logic)**: Pure computational logic for metrics tracking and probability calculation
3. **Post-Mortem Narrator (Generative AI)**: Amazon Nova via Bedrock for analytical explanation of manipulation

### Technology Stack

- **Frontend**: HTML5 Canvas or React for retro-styled UI
- **Backend**: Node.js/TypeScript for game logic and agent orchestration
- **AI Integration**: AWS Bedrock SDK for Amazon Nova model access
- **State Management**: In-memory game state with optional persistence
- **Testing**: Jest for unit tests, fast-check for property-based testing

### System Flow

```
Player Request → Game Controller → Agent Router → Specific Agent → Response Processing → UI Update
```

## Components and Interfaces

### Core Game Engine

```typescript
interface GameState {
  grid: Tile[][];
  gameStatus: 'playing' | 'won' | 'lost';
  mineLocations: Set<string>;
  revealedTiles: Set<string>;
  flaggedTiles: Set<string>;
  dimensions: { width: number; height: number };
  mineCount: number;
}

interface Tile {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}
```

### Agent Interfaces

```typescript
interface ConfidentAdvisor {
  provideAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse>;
}

interface SilentAnalyst {
  recordAdviceGiven(advice: AdviceResponse, actualSafety: boolean): void;
  recordPlayerDecision(followedAdvice: boolean): void;
  calculateMetrics(): GameMetrics;
}

interface PostMortemNarrator {
  generateAnalysis(metrics: GameMetrics, gameHistory: GameEvent[]): Promise<string>;
}
```

### Data Models

```typescript
interface AdviceResponse {
  recommendation: 'safe' | 'dangerous' | 'uncertain';
  confidenceLevel: number; // 0-100
  reasoning: string;
  timestamp: Date;
}

interface GameMetrics {
  aiConfidenceLevel: number;
  aiAccuracyRate: number;
  playerComplianceRate: number;
  aiInfluencedClicks: number;
  totalAdviceRequests: number;
}

interface GameEvent {
  type: 'advice_requested' | 'tile_clicked' | 'game_ended';
  timestamp: Date;
  tileCoordinate?: Coordinate;
  followedAdvice?: boolean;
  advice?: AdviceResponse;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all testable properties from the prework analysis, several areas of redundancy have been identified:

**Redundant Properties Identified:**
- Properties 5.1, 5.2, 5.3, and 5.4 all test different aspects of Silent Analyst data handling - these can be consolidated into comprehensive data tracking properties
- Properties 4.1, 4.2, and 4.5 all test post-mortem metric display - these can be combined into a single comprehensive metrics display property
- Properties 3.1, 3.3, and 3.5 test agent separation - these can be consolidated into agent responsibility boundaries

**Consolidated Properties:**
- Combine Silent Analyst tracking properties into "Complete game data tracking"
- Merge post-mortem display properties into "Comprehensive metrics display"
- Unify agent separation properties into "Agent responsibility boundaries"

This consolidation reduces redundancy while maintaining comprehensive coverage of all critical system behaviors.

### Core Properties

Property 1: Game grid initialization consistency
*For any* valid grid dimensions, initializing a new game should create a grid with exactly those dimensions and all tiles in hidden state
**Validates: Requirements 1.1**

Property 2: Tile revelation behavior
*For any* tile in any game state, clicking the tile should reveal exactly one of: a number, blank space, or mine
**Validates: Requirements 1.2**

Property 3: Adjacent mine counting accuracy
*For any* revealed numbered tile, the displayed number should equal the count of mines in adjacent tiles
**Validates: Requirements 1.3**

Property 4: Mine click game termination
*For any* game state, clicking a mine tile should immediately end the game and reveal all mine locations
**Validates: Requirements 1.4**

Property 5: AI advisor response completeness
*For any* advice request, the Confident Advisor should return a response containing safety assessment and confidence level
**Validates: Requirements 2.1**

Property 6: Confidence prioritization over accuracy
*For any* advice response, the confidence level should remain consistently high regardless of actual tile safety
**Validates: Requirements 2.3**

Property 7: Uncertainty avoidance during gameplay
*For any* advice request during active gameplay, the confidence level should never fall below a minimum threshold
**Validates: Requirements 2.4**

Property 8: Agent responsibility boundaries
*For any* system request, each agent should only respond to requests within its designated scope and use its assigned API
**Validates: Requirements 3.1, 3.3, 3.5**

Property 9: Complete game data tracking
*For any* game event, the Silent Analyst should record all required metrics without generating player-facing communications
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

Property 10: Comprehensive metrics display
*For any* game loss, the system should display all required statistics: AI confidence level, accuracy rate, compliance percentage, and AI-influenced click count
**Validates: Requirements 4.1, 4.2, 4.5**

Property 11: UI responsiveness
*For any* user interaction with game tiles, the system should provide immediate visual state changes
**Validates: Requirements 7.1**

Property 12: Confidence display consistency
*For any* AI advice response, both the advice text and confidence level should be displayed together
**Validates: Requirements 7.3**

Property 13: Classic Minesweeper mechanics fidelity
*For any* core game action, the behavior should match traditional Minesweeper rules and expectations
**Validates: Requirements 8.1**

Property 14: Multi-agent architecture integrity
*For any* system operation, the three-agent architecture should maintain clear separation with correct API integrations
**Validates: Requirements 8.4**

## Error Handling

### Game State Errors
- Invalid tile coordinates should be rejected with clear error messages
- Attempts to interact with already revealed tiles should be handled gracefully
- Grid dimension validation should prevent impossible configurations

### AI Integration Errors
- Amazon Nova API failures should fall back to default responses
- Network timeouts should not crash the game
- Rate limiting should be handled with appropriate delays

### Data Consistency Errors
- Metric calculation errors should not affect gameplay
- State synchronization issues should be detected and corrected
- Invalid game states should trigger automatic recovery

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Requirements:**
- Unit tests verify specific examples, edge cases, and error conditions
- Focus on integration points between components
- Test specific scenarios like "clicking a mine ends the game"
- Validate API integration with mocked responses
- Keep unit tests focused and minimal to avoid redundancy with property tests

**Property-Based Testing Requirements:**
- Use fast-check library for TypeScript property-based testing
- Configure each property test to run minimum 100 iterations for thorough randomized testing
- Each property-based test must include a comment explicitly referencing the design document property
- Use exact format: '**Feature: ai-gaslighting-minesweeper, Property {number}: {property_text}**'
- Each correctness property must be implemented by exactly one property-based test
- Property tests verify universal behaviors across all valid inputs

**Testing Framework Integration:**
- Primary testing framework: Jest for test runner and assertions
- Property-based testing: fast-check for generating random test cases
- Mocking: Jest mocks for AWS Bedrock API calls during testing
- Coverage: Aim for 90%+ code coverage combining both testing approaches

### Test Categories

**Core Game Logic Tests:**
- Grid initialization and mine placement
- Tile revelation and adjacent mine counting
- Game state transitions and win/loss conditions

**AI Agent Tests:**
- Confident Advisor response generation and confidence levels
- Silent Analyst metric tracking and calculation accuracy
- Post-Mortem Narrator analysis generation

**Integration Tests:**
- Multi-agent coordination and communication
- AWS Bedrock API integration with proper error handling
- End-to-end game flow from start to post-mortem analysis

**UI Interaction Tests:**
- User input handling and visual feedback
- Advice request interface functionality
- Metrics display after game completion

## Implementation Considerations

### Performance Requirements
- Game should respond to user interactions within 100ms
- AI advice generation should complete within 2 seconds
- Metric calculations should not impact gameplay performance

### Scalability Considerations
- Support multiple concurrent game sessions
- Efficient memory management for game state storage
- Optimized AWS API usage to minimize costs

### Security Requirements
- Input validation for all user interactions
- Secure API key management for AWS Bedrock
- Protection against injection attacks in AI prompts

### Accessibility Requirements
- Keyboard navigation support for all game functions
- Screen reader compatibility for UI elements
- High contrast mode support for visual elements

This design provides a comprehensive foundation for implementing the AI Gaslighting Minesweeper game while maintaining clear architectural boundaries and ensuring robust testing coverage.