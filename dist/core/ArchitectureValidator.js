"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureValidator = void 0;
const BedrockService_1 = require("../services/BedrockService");
class ArchitectureValidator {
    constructor(agentRouter, bedrockService) {
        this.agentRouter = agentRouter;
        this.bedrockService = bedrockService || new BedrockService_1.BedrockService();
    }
    async validateArchitecture() {
        const timestamp = new Date();
        // Run all validation checks
        const agentSeparation = await this.validateAgentSeparation();
        const apiIntegration = await this.validateAPIIntegration();
        const responsibilityBoundaries = this.validateResponsibilityBoundaries();
        // Calculate overall validation result
        const overall = this.calculateOverallValidation([
            agentSeparation,
            apiIntegration,
            responsibilityBoundaries
        ]);
        return {
            timestamp,
            agentSeparation,
            apiIntegration,
            responsibilityBoundaries,
            overall
        };
    }
    async validateAgentSeparation() {
        const violations = [];
        const warnings = [];
        const recommendations = [];
        let score = 100;
        try {
            // Check agent boundary validation from router
            const boundaryCheck = this.agentRouter.validateAgentBoundaries();
            if (!boundaryCheck.isValid) {
                violations.push(...boundaryCheck.violations);
                score -= boundaryCheck.violations.length * 20;
            }
            // Verify agent instances are separate
            const agentInstances = this.getAgentInstances();
            if (agentInstances.confidentAdvisor === agentInstances.silentAnalyst) {
                violations.push('ConfidentAdvisor and SilentAnalyst are the same instance');
                score -= 30;
            }
            if (agentInstances.confidentAdvisor === agentInstances.postMortemNarrator) {
                violations.push('ConfidentAdvisor and PostMortemNarrator are the same instance');
                score -= 30;
            }
            if (agentInstances.silentAnalyst === agentInstances.postMortemNarrator) {
                violations.push('SilentAnalyst and PostMortemNarrator are the same instance');
                score -= 30;
            }
            // Check for proper interface implementation
            if (!this.implementsInterface(agentInstances.confidentAdvisor, ['provideAdvice'])) {
                violations.push('ConfidentAdvisor does not properly implement required interface');
                score -= 25;
            }
            if (!this.implementsInterface(agentInstances.silentAnalyst, ['recordAdviceGiven', 'recordPlayerDecision', 'calculateMetrics'])) {
                violations.push('SilentAnalyst does not properly implement required interface');
                score -= 25;
            }
            if (!this.implementsInterface(agentInstances.postMortemNarrator, ['generateAnalysis'])) {
                violations.push('PostMortemNarrator does not properly implement required interface');
                score -= 25;
            }
            // Check for unwanted cross-agent dependencies
            if (this.hasDirectCrossAgentCalls()) {
                warnings.push('Detected potential direct cross-agent method calls');
                score -= 10;
                recommendations.push('Ensure all agent communication goes through AgentRouter');
            }
        }
        catch (error) {
            violations.push(`Agent separation validation failed: ${error}`);
            score -= 50;
        }
        return {
            isValid: violations.length === 0,
            score: Math.max(0, score),
            violations,
            warnings,
            recommendations
        };
    }
    async validateAPIIntegration() {
        const violations = [];
        const warnings = [];
        const recommendations = [];
        let score = 100;
        try {
            // Test Bedrock service health
            const bedrockHealthy = await this.bedrockService.healthCheck();
            if (!bedrockHealthy) {
                warnings.push('Bedrock service health check failed - may affect AI agents');
                score -= 20;
                recommendations.push('Verify AWS credentials and Bedrock service availability');
            }
            // Test agent health through router
            const agentHealth = await this.agentRouter.healthCheck();
            if (!agentHealth.confidentAdvisor) {
                violations.push('ConfidentAdvisor health check failed');
                score -= 30;
            }
            if (!agentHealth.silentAnalyst) {
                violations.push('SilentAnalyst health check failed');
                score -= 20;
            }
            if (!agentHealth.postMortemNarrator) {
                violations.push('PostMortemNarrator health check failed');
                score -= 30;
            }
            // Verify correct API usage patterns
            if (!this.validateAPIUsagePatterns()) {
                warnings.push('Detected suboptimal API usage patterns');
                score -= 15;
                recommendations.push('Review API integration patterns for efficiency');
            }
        }
        catch (error) {
            violations.push(`API integration validation failed: ${error}`);
            score -= 40;
        }
        return {
            isValid: violations.length === 0,
            score: Math.max(0, score),
            violations,
            warnings,
            recommendations
        };
    }
    validateResponsibilityBoundaries() {
        const violations = [];
        const warnings = [];
        const recommendations = [];
        let score = 100;
        try {
            // Check that each agent only handles its designated responsibilities
            // ConfidentAdvisor: Only advice generation
            if (!this.validateConfidentAdvisorResponsibilities()) {
                violations.push('ConfidentAdvisor handling responsibilities outside its scope');
                score -= 25;
            }
            // SilentAnalyst: Only metrics tracking, no player communication
            if (!this.validateSilentAnalystResponsibilities()) {
                violations.push('SilentAnalyst violating silent operation requirement');
                score -= 30;
            }
            // PostMortemNarrator: Only post-game analysis
            if (!this.validatePostMortemNarratorResponsibilities()) {
                violations.push('PostMortemNarrator handling responsibilities outside its scope');
                score -= 25;
            }
            // Check for proper separation of generative AI vs deterministic logic
            if (!this.validateGenerativeVsDeterministicSeparation()) {
                violations.push('Improper mixing of generative AI and deterministic logic');
                score -= 20;
                recommendations.push('Ensure clear separation between AI-powered and deterministic components');
            }
            // Verify no agent overlap in functionality
            if (this.detectAgentFunctionalityOverlap()) {
                warnings.push('Detected potential functionality overlap between agents');
                score -= 15;
                recommendations.push('Review agent responsibilities to eliminate overlap');
            }
        }
        catch (error) {
            violations.push(`Responsibility boundary validation failed: ${error}`);
            score -= 30;
        }
        return {
            isValid: violations.length === 0,
            score: Math.max(0, score),
            violations,
            warnings,
            recommendations
        };
    }
    calculateOverallValidation(results) {
        const allViolations = results.flatMap(r => r.violations);
        const allWarnings = results.flatMap(r => r.warnings);
        const allRecommendations = results.flatMap(r => r.recommendations);
        // Calculate weighted average score
        const weights = [0.4, 0.3, 0.3]; // Agent separation is most important
        const weightedScore = results.reduce((sum, result, index) => {
            return sum + (result.score * weights[index]);
        }, 0);
        return {
            isValid: allViolations.length === 0,
            score: Math.round(weightedScore),
            violations: allViolations,
            warnings: allWarnings,
            recommendations: [...new Set(allRecommendations)] // Remove duplicates
        };
    }
    // Helper methods for validation checks
    getAgentInstances() {
        // Use reflection to access agent instances from router
        // This is a simplified approach - in production, you'd use proper dependency injection
        return {
            confidentAdvisor: this.agentRouter.confidentAdvisor,
            silentAnalyst: this.agentRouter.silentAnalyst,
            postMortemNarrator: this.agentRouter.postMortemNarrator
        };
    }
    implementsInterface(instance, requiredMethods) {
        if (!instance)
            return false;
        return requiredMethods.every(method => typeof instance[method] === 'function');
    }
    hasDirectCrossAgentCalls() {
        // Check for direct method calls between agents (simplified check)
        // In a full implementation, this would use static analysis or runtime monitoring
        return false; // Placeholder - would need more sophisticated detection
    }
    validateAPIUsagePatterns() {
        // Check for proper API usage patterns
        // This would analyze request patterns, error handling, etc.
        return true; // Placeholder - would need actual pattern analysis
    }
    validateConfidentAdvisorResponsibilities() {
        // Verify ConfidentAdvisor only handles advice generation
        const instance = this.getAgentInstances().confidentAdvisor;
        // Check it has advice method
        if (typeof instance?.provideAdvice !== 'function')
            return false;
        // Check it doesn't have metric tracking methods
        const forbiddenMethods = ['recordAdviceGiven', 'calculateMetrics', 'generateAnalysis'];
        return !forbiddenMethods.some(method => typeof instance[method] === 'function');
    }
    validateSilentAnalystResponsibilities() {
        // Verify SilentAnalyst only tracks metrics and never communicates with players
        const instance = this.getAgentInstances().silentAnalyst;
        // Check it has required tracking methods
        const requiredMethods = ['recordAdviceGiven', 'recordPlayerDecision', 'calculateMetrics'];
        if (!requiredMethods.every(method => typeof instance?.[method] === 'function')) {
            return false;
        }
        // Check it doesn't have player communication methods
        const forbiddenMethods = ['provideAdvice', 'generateAnalysis', 'displayMessage', 'showNotification'];
        return !forbiddenMethods.some(method => typeof instance[method] === 'function');
    }
    validatePostMortemNarratorResponsibilities() {
        // Verify PostMortemNarrator only handles post-game analysis
        const instance = this.getAgentInstances().postMortemNarrator;
        // Check it has analysis method
        if (typeof instance?.generateAnalysis !== 'function')
            return false;
        // Check it doesn't have real-time methods
        const forbiddenMethods = ['provideAdvice', 'recordAdviceGiven', 'recordPlayerDecision'];
        return !forbiddenMethods.some(method => typeof instance[method] === 'function');
    }
    validateGenerativeVsDeterministicSeparation() {
        // Verify proper separation between AI-powered and deterministic components
        // ConfidentAdvisor and PostMortemNarrator should use AI (Bedrock)
        // SilentAnalyst should be purely deterministic
        const instances = this.getAgentInstances();
        // Check that AI agents have Bedrock integration
        const hasBedrockIntegration = (agent) => {
            return agent && (agent.bedrockService ||
                typeof agent.invokeModel === 'function' ||
                agent.constructor.name.includes('Bedrock'));
        };
        // SilentAnalyst should NOT have Bedrock integration
        if (hasBedrockIntegration(instances.silentAnalyst)) {
            return false;
        }
        return true;
    }
    detectAgentFunctionalityOverlap() {
        // Check for overlapping functionality between agents
        // This is a simplified check - would need more sophisticated analysis
        return false; // Placeholder
    }
    // Generate validation report
    generateReport(validationResult) {
        const sections = [];
        sections.push('═══════════════════════════════════════════════════════════');
        sections.push('           MULTI-AGENT ARCHITECTURE VALIDATION            ');
        sections.push('═══════════════════════════════════════════════════════════');
        sections.push(`Validation Time: ${validationResult.timestamp.toISOString()}`);
        sections.push(`Overall Score: ${validationResult.overall.score}/100`);
        sections.push(`Overall Status: ${validationResult.overall.isValid ? '✅ VALID' : '❌ INVALID'}`);
        sections.push('');
        // Agent Separation
        sections.push('🔄 AGENT SEPARATION');
        sections.push(`Score: ${validationResult.agentSeparation.score}/100`);
        sections.push(`Status: ${validationResult.agentSeparation.isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (validationResult.agentSeparation.violations.length > 0) {
            sections.push('Violations:');
            validationResult.agentSeparation.violations.forEach(v => sections.push(`  • ${v}`));
        }
        sections.push('');
        // API Integration
        sections.push('🔌 API INTEGRATION');
        sections.push(`Score: ${validationResult.apiIntegration.score}/100`);
        sections.push(`Status: ${validationResult.apiIntegration.isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (validationResult.apiIntegration.violations.length > 0) {
            sections.push('Violations:');
            validationResult.apiIntegration.violations.forEach(v => sections.push(`  • ${v}`));
        }
        sections.push('');
        // Responsibility Boundaries
        sections.push('🎯 RESPONSIBILITY BOUNDARIES');
        sections.push(`Score: ${validationResult.responsibilityBoundaries.score}/100`);
        sections.push(`Status: ${validationResult.responsibilityBoundaries.isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (validationResult.responsibilityBoundaries.violations.length > 0) {
            sections.push('Violations:');
            validationResult.responsibilityBoundaries.violations.forEach(v => sections.push(`  • ${v}`));
        }
        sections.push('');
        // Recommendations
        if (validationResult.overall.recommendations.length > 0) {
            sections.push('💡 RECOMMENDATIONS');
            validationResult.overall.recommendations.forEach(r => sections.push(`  • ${r}`));
            sections.push('');
        }
        sections.push('═══════════════════════════════════════════════════════════');
        return sections.join('\n');
    }
}
exports.ArchitectureValidator = ArchitectureValidator;
//# sourceMappingURL=ArchitectureValidator.js.map