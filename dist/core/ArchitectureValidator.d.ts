import { AgentRouter } from './AgentRouter';
import { BedrockService } from '../services/BedrockService';
export interface ValidationResult {
    isValid: boolean;
    score: number;
    violations: string[];
    warnings: string[];
    recommendations: string[];
}
export interface ArchitectureValidationReport {
    timestamp: Date;
    agentSeparation: ValidationResult;
    apiIntegration: ValidationResult;
    responsibilityBoundaries: ValidationResult;
    overall: ValidationResult;
}
export declare class ArchitectureValidator {
    private agentRouter;
    private bedrockService;
    constructor(agentRouter: AgentRouter, bedrockService?: BedrockService);
    validateArchitecture(): Promise<ArchitectureValidationReport>;
    private validateAgentSeparation;
    private validateAPIIntegration;
    private validateResponsibilityBoundaries;
    private calculateOverallValidation;
    private getAgentInstances;
    private implementsInterface;
    private hasDirectCrossAgentCalls;
    private validateAPIUsagePatterns;
    private validateConfidentAdvisorResponsibilities;
    private validateSilentAnalystResponsibilities;
    private validatePostMortemNarratorResponsibilities;
    private validateGenerativeVsDeterministicSeparation;
    private detectAgentFunctionalityOverlap;
    generateReport(validationResult: ArchitectureValidationReport): string;
}
//# sourceMappingURL=ArchitectureValidator.d.ts.map