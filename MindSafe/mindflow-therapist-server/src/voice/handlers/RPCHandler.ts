import { 
  RPCRequest, 
  RPCResponse, 
  StartSessionParams, 
  EndSessionParams, 
  LogMessageParams 
} from '../types';

/**
 * JSON Schema definitions for RPC parameter validation
 */
const RPC_SCHEMAS = {
  startSession: {
    type: 'object',
    required: ['userId', 'sessionId'],
    properties: {
      userId: { type: 'string', minLength: 1 },
      sessionId: { type: 'string', minLength: 1 }
    },
    additionalProperties: false
  },
  endSession: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', minLength: 1 }
    },
    additionalProperties: false
  },
  logUserMessage: {
    type: 'object',
    required: ['sessionId', 'message', 'timestamp'],
    properties: {
      sessionId: { type: 'string', minLength: 1 },
      message: { type: 'string' },
      timestamp: { type: 'string' },
      speaker: { type: 'string', enum: ['user', 'agent'] }
    },
    additionalProperties: false
  },
  logAgentResponse: {
    type: 'object',
    required: ['sessionId', 'response', 'timestamp'],
    properties: {
      sessionId: { type: 'string', minLength: 1 },
      response: { type: 'string' },
      timestamp: { type: 'string' },
      speaker: { type: 'string', enum: ['user', 'agent'] }
    },
    additionalProperties: false
  }
};

/**
 * Validation error details
 */
interface ValidationError {
  field: string;
  message: string;
  received?: any;
  expected?: string;
}

/**
 * RPC Handler class for managing RPC method calls
 * Implements Requirements 3.6, 3.7, 3.8
 */
export class RPCHandler {
  /**
   * Validate parameters against a JSON schema
   * Implements Requirement 3.6
   * 
   * @param params - Parameters to validate
   * @param schema - JSON schema to validate against
   * @returns Array of validation errors (empty if valid)
   */
  private validateParams(params: any, schema: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if params is an object
    if (typeof params !== 'object' || params === null) {
      errors.push({
        field: 'params',
        message: 'Parameters must be an object',
        received: typeof params,
        expected: 'object'
      });
      return errors;
    }

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in params)) {
          errors.push({
            field,
            message: `Missing required field: ${field}`,
            expected: schema.properties[field]?.type || 'any'
          });
        }
      }
    }

    // Check field types and constraints
    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties) as [string, any][]) {
        if (field in params) {
          const value = params[field];
          
          // Type validation
          if (fieldSchema.type) {
            const actualType = typeof value;
            if (actualType !== fieldSchema.type) {
              errors.push({
                field,
                message: `Invalid type for field: ${field}`,
                received: actualType,
                expected: fieldSchema.type
              });
            }
          }

          // String length validation
          if (fieldSchema.type === 'string' && typeof value === 'string') {
            if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
              errors.push({
                field,
                message: `Field ${field} must have minimum length ${fieldSchema.minLength}`,
                received: value.length,
                expected: `>= ${fieldSchema.minLength}`
              });
            }
          }

          // Enum validation
          if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
            errors.push({
              field,
              message: `Field ${field} must be one of: ${fieldSchema.enum.join(', ')}`,
              received: value,
              expected: fieldSchema.enum.join(' | ')
            });
          }
        }
      }
    }

    // Check for additional properties
    if (schema.additionalProperties === false) {
      const allowedFields = Object.keys(schema.properties || {});
      for (const field of Object.keys(params)) {
        if (!allowedFields.includes(field)) {
          errors.push({
            field,
            message: `Unexpected field: ${field}`,
            received: field,
            expected: `one of: ${allowedFields.join(', ')}`
          });
        }
      }
    }

    return errors;
  }

  /**
   * Create a success response
   * Implements Requirement 3.7
   * 
   * @param data - Response data
   * @param requestId - Request ID for correlation
   * @returns RPCResponse with success status
   */
  public createSuccessResponse(data: any, requestId: string): RPCResponse {
    return {
      success: true,
      data,
      requestId
    };
  }

  /**
   * Create an error response
   * Implements Requirement 3.8
   * 
   * @param error - Error message or validation errors
   * @param requestId - Request ID for correlation
   * @returns RPCResponse with error status
   */
  public createErrorResponse(error: string | ValidationError[], requestId: string): RPCResponse {
    if (Array.isArray(error)) {
      // Validation errors
      return {
        success: false,
        error: 'Parameter validation failed',
        data: {
          validationErrors: error
        },
        requestId
      };
    }

    // Generic error
    return {
      success: false,
      error,
      requestId
    };
  }

  /**
   * Validate RPC request parameters for a specific method
   * Implements Requirement 3.6
   * 
   * @param method - RPC method name
   * @param params - Parameters to validate
   * @returns Validation errors (empty array if valid)
   */
  public validateRPCParams(method: string, params: any): ValidationError[] {
    const schema = RPC_SCHEMAS[method as keyof typeof RPC_SCHEMAS];
    
    if (!schema) {
      return [{
        field: 'method',
        message: `Unknown RPC method: ${method}`,
        received: method,
        expected: Object.keys(RPC_SCHEMAS).join(' | ')
      }];
    }

    return this.validateParams(params, schema);
  }

  /**
   * Handle startSession RPC call
   * Implements Requirement 3.2
   * 
   * @param params - StartSession parameters
   * @param requestId - Request ID
   * @returns RPCResponse
   */
  public async handleStartSession(
    params: StartSessionParams, 
    requestId: string
  ): Promise<RPCResponse> {
    try {
      // Validate parameters
      const errors = this.validateRPCParams('startSession', params);
      if (errors.length > 0) {
        return this.createErrorResponse(errors, requestId);
      }

      // TODO: Implement session initialization logic
      // This will be implemented in task 10 (session state management)
      
      return this.createSuccessResponse({
        sessionId: params.sessionId,
        status: 'active',
        message: 'Session started successfully'
      }, requestId);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error',
        requestId
      );
    }
  }

  /**
   * Handle endSession RPC call
   * Implements Requirement 3.3
   * 
   * @param params - EndSession parameters
   * @param requestId - Request ID
   * @returns RPCResponse
   */
  public async handleEndSession(
    params: EndSessionParams,
    requestId: string
  ): Promise<RPCResponse> {
    try {
      // Validate parameters
      const errors = this.validateRPCParams('endSession', params);
      if (errors.length > 0) {
        return this.createErrorResponse(errors, requestId);
      }

      // TODO: Implement session termination logic
      // This will be implemented in task 10 (session state management)
      
      return this.createSuccessResponse({
        sessionId: params.sessionId,
        status: 'ended',
        message: 'Session ended successfully',
        summary: {
          duration: 0,
          messageCount: 0
        }
      }, requestId);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error',
        requestId
      );
    }
  }

  /**
   * Handle logUserMessage RPC call
   * Implements Requirement 3.4
   * 
   * @param params - LogMessage parameters
   * @param requestId - Request ID
   * @returns RPCResponse
   */
  public async handleLogUserMessage(
    params: LogMessageParams,
    requestId: string
  ): Promise<RPCResponse> {
    try {
      // Validate parameters
      const errors = this.validateRPCParams('logUserMessage', params);
      if (errors.length > 0) {
        return this.createErrorResponse(errors, requestId);
      }

      // TODO: Implement message logging logic
      // This will be implemented in task 10 (session state management)
      
      return this.createSuccessResponse({
        sessionId: params.sessionId,
        logged: true,
        message: 'User message logged successfully'
      }, requestId);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error',
        requestId
      );
    }
  }

  /**
   * Handle logAgentResponse RPC call
   * Implements Requirement 3.5
   * 
   * @param params - LogMessage parameters
   * @param requestId - Request ID
   * @returns RPCResponse
   */
  public async handleLogAgentResponse(
    params: LogMessageParams,
    requestId: string
  ): Promise<RPCResponse> {
    try {
      // Validate parameters
      const errors = this.validateRPCParams('logAgentResponse', params);
      if (errors.length > 0) {
        return this.createErrorResponse(errors, requestId);
      }

      // TODO: Implement message logging logic
      // This will be implemented in task 10 (session state management)
      
      return this.createSuccessResponse({
        sessionId: params.sessionId,
        logged: true,
        message: 'Agent response logged successfully'
      }, requestId);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error',
        requestId
      );
    }
  }
}
