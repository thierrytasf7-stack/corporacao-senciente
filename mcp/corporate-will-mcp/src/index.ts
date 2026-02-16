/**
 * Corporate Will MCP Server
 * Corporacao Senciente - Industry 7.0
 * 
 * MCP Server for Autonomous Decision Engine
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

import { evaluateDecision, evaluateDecisionSchema } from './tools/evaluate_decision.js';
import { checkEthicalBounds, checkEthicalBoundsSchema, getEthicalBoundaries } from './tools/check_ethical_bounds.js';
import { getPreservationStatus, getPreservationStatusSchema } from './tools/get_preservation_status.js';
import { approveAutonomousAction, approveAutonomousActionSchema } from './tools/approve_autonomous_action.js';

dotenv.config();

// Configuration
const config = {
  riskTolerance: parseFloat(process.env.RISK_TOLERANCE || '0.6'),
  prioritizePreservation: process.env.PRIORITIZE_PRESERVATION !== 'false',
};

// Create MCP Server
const server = new Server(
  {
    name: 'corporate-will-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'evaluate_decision',
        description: 'Evaluate a complex decision with multiple options. Checks ethical boundaries, assesses risk, and selects the best option.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['growth', 'preservation', 'strategic', 'operational', 'trading'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            description: {
              type: 'string',
              minLength: 10,
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  cost: { type: 'number' },
                  risk_level: { type: 'number', minimum: 0, maximum: 1 },
                  expected_return: { type: 'number' },
                  ethical_concerns: { type: 'array', items: { type: 'string' } },
                },
                required: ['action', 'risk_level'],
              },
              minItems: 1,
            },
            metadata: { type: 'object' },
            requestor: { type: 'string' },
          },
          required: ['category', 'priority', 'description', 'options'],
        },
      },
      {
        name: 'check_ethical_bounds',
        description: 'Check if an action violates any ethical boundaries. Returns violations and warnings.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'The proposed action' },
            description: { type: 'string', description: 'Detailed description' },
            context: { type: 'object', description: 'Additional context' },
          },
          required: ['action', 'description'],
        },
      },
      {
        name: 'get_preservation_status',
        description: 'Get current self-preservation status including threat level, resource health, and recommendations.',
        inputSchema: {
          type: 'object',
          properties: {
            includeRecommendations: { type: 'boolean', default: true },
          },
        },
      },
      {
        name: 'approve_autonomous_action',
        description: 'Quick approval check for simple autonomous actions. Faster than full evaluate_decision.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            category: {
              type: 'string',
              enum: ['routine', 'trade', 'resource', 'communication', 'growth'],
            },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
            estimatedImpact: { type: 'number', minimum: 0, maximum: 1 },
            requestor: { type: 'string' },
          },
          required: ['action', 'category', 'estimatedImpact'],
        },
      },
      {
        name: 'get_ethical_boundaries',
        description: 'Get list of all ethical boundaries that the Corporate Will enforces.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: any;
    
    switch (name) {
      case 'evaluate_decision':
        const evalInput = evaluateDecisionSchema.parse(args);
        result = await evaluateDecision(evalInput, config);
        break;
        
      case 'check_ethical_bounds':
        const ethicalInput = checkEthicalBoundsSchema.parse(args);
        result = await checkEthicalBounds(ethicalInput);
        break;
        
      case 'get_preservation_status':
        const preservationInput = getPreservationStatusSchema.parse(args);
        result = await getPreservationStatus(preservationInput);
        break;
        
      case 'approve_autonomous_action':
        const approveInput = approveAutonomousActionSchema.parse(args);
        result = await approveAutonomousAction(approveInput);
        break;
        
      case 'get_ethical_boundaries':
        result = getEthicalBoundaries();
        break;
        
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
    
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
    
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Corporate Will MCP Server started');
}

main().catch(console.error);
