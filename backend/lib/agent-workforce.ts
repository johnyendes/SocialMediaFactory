/**
 * Ultimate Agent Workforce Integration
 * Connects the Python-based agent system with our Next.js application
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface AgentRequest {
  factoryType: 'courseforge' | 'blog' | 'social' | 'app' | 'bot' | 'content' | 'tech';
  task: string;
  context?: string;
  parameters?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  result?: string;
  error?: string;
  artifacts?: string[];
  timestamp: string;
}

export class AgentWorkforceManager {
  private pythonScriptPath: string;
  private workspacePath: string;

  constructor() {
    this.pythonScriptPath = path.join(process.cwd(), 'ULTIMATE_AGENT_WORKFORCE.py');
    this.workspacePath = path.join(process.cwd(), 'agent_workspace');
  }

  /**
   * Initialize the agent workspace
   */
  async initialize(): Promise<void> {
    try {
      // Ensure workspace directory exists
      await fs.mkdir(this.workspacePath, { recursive: true });
      
      // Check if Python script exists
      const scriptExists = await fs.access(this.pythonScriptPath)
        .then(() => true)
        .catch(() => false);

      if (!scriptExists) {
        throw new Error('ULTIMATE_AGENT_WORKFORCE.py not found in project root');
      }

      console.log('✅ Agent Workforce initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Agent Workforce:', error);
      throw error;
    }
  }

  /**
   * Execute an agent task
   */
  async executeTask(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Create a temporary Python script to execute the task
      const taskScript = this.generateTaskScript(request);
      const scriptPath = path.join(this.workspacePath, `task_${Date.now()}.py`);
      
      await fs.writeFile(scriptPath, taskScript);

      // Execute the Python script
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
        env: {
          ...process.env,
          PYTHONPATH: process.cwd(),
          STORAGE_PATH: this.workspacePath
        },
        timeout: 60000 // 60 second timeout
      });

      // Clean up temporary script
      await fs.unlink(scriptPath).catch(() => {});

      if (stderr && !stderr.includes('INFO')) {
        console.error('Agent stderr:', stderr);
      }

      // Parse the response
      const response: AgentResponse = {
        success: true,
        result: stdout.trim(),
        timestamp: new Date().toISOString()
      };

      return response;

    } catch (error: any) {
      console.error('Agent execution error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate Python script for task execution
   */
  private generateTaskScript(request: AgentRequest): string {
    const { factoryType, task, context, parameters } = request;

    return `
import sys
sys.path.insert(0, '${process.cwd()}')

from ULTIMATE_AGENT_WORKFORCE import quick_setup_factory

# Initialize factory
factory = quick_setup_factory('${factoryType}')

# Execute task
context = ${context ? `"""${context}"""` : 'None'}
result = factory.process_request("""${task}""", context=context)

# Output result
print(result)
`;
  }

  /**
   * Create a course outline (CourseForge)
   */
  async createCourseOutline(topic: string, level: string, duration: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'courseforge',
      task: `Generate a comprehensive course outline for "${topic}" at ${level} level, duration: ${duration}`,
      parameters: { topic, level, duration }
    });
  }

  /**
   * Create a blog post (Blog Factory)
   */
  async createBlogPost(topic: string, style: string, wordCount: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'blog',
      task: `Write a ${style} blog post about "${topic}" with approximately ${wordCount} words`,
      parameters: { topic, style, wordCount }
    });
  }

  /**
   * Create social media content (Social Media Factory)
   */
  async createSocialContent(platform: string, topic: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'social',
      task: `Create engaging ${platform} content about "${topic}"`,
      parameters: { platform, topic }
    });
  }

  /**
   * Create app prototype (App Factory)
   */
  async createAppPrototype(description: string, type: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'app',
      task: `Create a ${type} application prototype for: ${description}`,
      parameters: { description, type }
    });
  }

  /**
   * Develop technical solution (Tech Factory)
   */
  async developTechSolution(problem: string, technology: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'tech',
      task: `Develop a technical solution for "${problem}" using ${technology}`,
      parameters: { problem, technology }
    });
  }

  /**
   * Create content calendar (Content Factory)
   */
  async createContentCalendar(duration: string, niche: string): Promise<AgentResponse> {
    return this.executeTask({
      factoryType: 'content',
      task: `Create a ${duration} content calendar for ${niche} niche`,
      parameters: { duration, niche }
    });
  }

  /**
   * Get available artifacts
   */
  async getArtifacts(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.workspacePath);
      return files.filter(f => !f.startsWith('task_'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get artifact content
   */
  async getArtifact(filename: string): Promise<string> {
    const filePath = path.join(this.workspacePath, filename);
    return await fs.readFile(filePath, 'utf-8');
  }
}

// Singleton instance
let agentWorkforceInstance: AgentWorkforceManager | null = null;

export function getAgentWorkforce(): AgentWorkforceManager {
  if (!agentWorkforceInstance) {
    agentWorkforceInstance = new AgentWorkforceManager();
  }
  return agentWorkforceInstance;
}