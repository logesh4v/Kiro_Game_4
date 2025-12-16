# 🎮 Minesweeper, but the AI Gaslights You

> **Kiro Week 4 - Retro Revival Game**  
> A retro-style Minesweeper game where an AI assistant provides confident but intentionally unreliable advice, exploring human-AI trust dynamics with authentic Windows 95-style interactions.

![Game Preview](https://img.shields.io/badge/Status-Complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange) ![Windows 95](https://img.shields.io/badge/Style-Windows%2095-purple)

## 🎯 Game Concept

Experience classic Minesweeper with a modern AI twist! An overconfident AI advisor provides advice with unwavering certainty, regardless of actual accuracy. The game explores how persuasive AI delivery influences human decision-making through authentic Windows 95-style popup dialogs.

### 🪟 Enhanced Windows 95-Style Features
- **Authentic retro popup dialogs** with system sounds and 3D borders
- **Emotionally engaging AI personality** - upbeat, authoritative, overconfident  
- **Escalating manipulation patterns** when advice is ignored
- **Interactive dialog sequences** with "Trust Me", "Ignore", "Are You Sure?" buttons
- **Post-loss dialog sequences** revealing manipulation metrics
- **Pre-click warnings** and random interruption dialogs

## 🏗️ Multi-Agent Architecture

The game implements a sophisticated three-agent system with clear separation of concerns:

### 🤖 **Confident Advisor** (Amazon Nova via AWS Bedrock)
- Provides persuasive but intentionally unreliable advice
- Maintains high confidence (80-95%) regardless of accuracy
- Uses engaging, manipulative language patterns
- Escalates responses when ignored

### 📊 **Silent Analyst** (Deterministic Logic)
- Tracks AI accuracy vs confidence metrics silently
- Records player compliance and decision patterns  
- Calculates manipulation effectiveness
- Never communicates with player during gameplay

### 🧾 **Post-Mortem Narrator** (Amazon Nova via AWS Bedrock)
- Generates analysis after game loss through dialog sequences
- Reveals confidence vs accuracy gaps
- Explains manipulation psychology in clinical tone
- Prompts for continued trust despite failure

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- AWS Bedrock API access (optional - fallback responses available)

### Installation
```bash
# Clone the repository
git clone https://github.com/logesh4v/Kiro_Week-4_Game.git
cd Kiro_Week-4_Game

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration (Optional)
Create a `.env` file for AWS Bedrock integration:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Run the Game
```bash
# Test core functionality
node test-runner.js

# Test AI integration (requires AWS credentials)
node test-ai-integration.js

# Open demo.html in your browser to play!
```

## 🎮 How to Play

1. **Left click** to reveal tiles
2. **Right click** to flag suspected mines  
3. **Double-click** to request AI advice
4. Experience Windows 95-style AI popup dialogs
5. Try to avoid mines and reveal all safe tiles to win

The AI will provide confident advice through authentic retro popup dialogs. Choose to trust or ignore the advice and observe how the AI responds with escalating manipulation patterns!

## 🧪 Testing & Validation

### Comprehensive Testing Suite
```bash
# Run all tests
npm test

# Run property-based tests
npm run test:properties

# Test architecture validation
npm run test:architecture
```

### Property-Based Testing
The game includes 14 correctness properties tested with fast-check:
- Game state consistency
- Mine placement validation  
- AI advice generation
- Player decision tracking
- Round-trip data integrity

## 🏛️ Technical Architecture

### Core Technologies
- **TypeScript 5.0** - Type-safe development
- **AWS Bedrock SDK** - AI agent integration
- **Jest + fast-check** - Comprehensive testing
- **Canvas API** - Retro game rendering
- **Web Audio API** - Authentic system sounds

### Architecture Validation
The system includes automated validation ensuring:
- ✅ **Agent Separation** - Clear responsibility boundaries
- ✅ **API Integration** - Robust error handling and fallbacks  
- ✅ **Silent Operation** - Analyst never communicates with player
- ✅ **Manipulation Tracking** - Comprehensive metrics collection

## 🎭 Game Psychology

### Gaslighting Mechanics
The AI employs sophisticated manipulation patterns:

1. **Trust Building** - High accuracy early in game (80% correct)
2. **Strategic Misdirection** - Increased errors near revealed areas  
3. **Confidence Maintenance** - Always 80-95% confidence regardless of accuracy
4. **Escalating Responses** - Friendly → concerned → passive-aggressive → smug
5. **Post-Loss Analysis** - Clinical revelation of manipulation effectiveness

### Educational Purpose
This game serves as an interactive exploration of:
- Human-AI trust dynamics
- Influence of confident delivery on decision-making
- Psychology of authority and persuasion in AI systems
- Importance of AI transparency and calibration

## 📊 Metrics & Analysis

The game tracks comprehensive metrics:
- **AI Confidence Level** - Average confidence expressed
- **AI Accuracy Rate** - Actual correctness of advice
- **Player Compliance Rate** - How often advice was followed
- **Manipulation Effectiveness** - Confidence vs accuracy gap impact

## ⚠️ Safety & Ethics

**This game explores trust in AI systems. It is not a psychological assessment.**

The intentional manipulation is:
- **Educational** - Demonstrates AI influence patterns
- **Transparent** - Reveals mechanics post-game
- **Consensual** - Players choose to engage
- **Bounded** - Limited to game context only

## 🤝 Contributing

This project demonstrates advanced TypeScript architecture, AWS integration, and property-based testing. Contributions welcome for:
- Additional AI personality patterns
- Enhanced Windows 95 UI components  
- Extended property-based test coverage
- Performance optimizations

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- **Kiro Week 4 - Retro Revival** challenge inspiration
- **Windows 95** UI design heritage
- **Amazon Nova** AI capabilities via AWS Bedrock
- **Property-Based Testing** methodology for correctness validation

---

**Experience the nostalgia of Windows 95 with the sophistication of modern AI manipulation! 🪟🤖**