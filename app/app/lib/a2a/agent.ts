/**
 * Twin Style A2A Agent Implementation
 * 
 * This file implements the A2A agent that executes skills for
 * wardrobe management, image processing, and outfit generation.
 */

import { A2AAgent } from './types';
import { twinStyleAgentCard } from './agent-card';
import { getOpenRouterClient } from '@/app/lib/ai/openrouter';
import { mcpServer } from './mcp';

export class TwinStyleAgent implements A2AAgent {
  card = twinStyleAgentCard;
  private openrouter = getOpenRouterClient();

  async executeSkill(skillName: string, input: unknown, context?: unknown): Promise<unknown> {
    console.log(`Executing skill: ${skillName}`, { input, context });

    switch (skillName) {
      case 'generate_catalog_image':
        return await this.generateCatalogImage(input);
      
      case 'infer_item_attributes':
        return await this.inferItemAttributes(input);
      
      case 'extract_label_info':
        return await this.extractLabelInfo(input);
      
      case 'generate_outfit':
        return await this.generateOutfit(input);
      
      default:
        throw new Error(`Unknown skill: ${skillName}`);
    }
  }

  private async generateCatalogImage(input: { imageBase64: string }): Promise<unknown> {
    const { imageBase64 } = input;

    try {
      const generatedImageUrl = await this.openrouter.generateCatalogImage(imageBase64);

      return {
        generatedImageUrl,
        confidence: 0.9, // High confidence for catalog generation
      };
    } catch (error) {
      console.error('Error generating catalog image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate catalog image: ${errorMessage}`);
    }
  }

  private async inferItemAttributes(input: { imageBase64: string; userPrompt?: string }): Promise<unknown> {
    const { imageBase64, userPrompt } = input;

    try {
      const result = await this.openrouter.inferItemAttributes(imageBase64, userPrompt);

      return {
        category: result.category || 'uncategorized',
        colors: result.colors || [],
        pattern: result.pattern || 'unknown',
        style: result.style || [],
        occasion: result.occasion || [],
        confidence: result.confidence || {},
      };
    } catch (error) {
      console.error('Error inferring item attributes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to infer item attributes: ${errorMessage}`);
    }
  }

  private async extractLabelInfo(input: { imageBase64: string }): Promise<unknown> {
    const { imageBase64 } = input;

    try {
      const result = await this.openrouter.extractLabelInfo(imageBase64);

      return {
        brand: result.brand || 'Unknown',
        careInstructions: result.careInstructions || '',
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      console.error('Error extracting label info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to extract label info: ${errorMessage}`);
    }
  }

  private async generateOutfit(input: { constraints: Record<string, unknown>; availableItems?: Array<Record<string, unknown>> }): Promise<unknown> {
    const { constraints } = input;
    let { availableItems } = input;

    try {
      // If no items provided, fetch from MCP data source
      if (!availableItems || availableItems.length === 0) {
        console.log('Fetching available items from MCP data source');
        availableItems = await mcpServer.callTool(
          'wardrobe-database',
          'get_available_items',
          { limit: 50 }
        ) as Array<Record<string, unknown>>;
      }

      // Use text model for outfit generation
      const prompt = this.buildOutfitPrompt(constraints, availableItems);
      const result = await this.openrouter.generateText(prompt);

      // Parse the result to extract outfit suggestions
      const outfits = this.parseOutfitResponse(result, availableItems);

      return {
        outfits,
      };
    } catch (error) {
      console.error('Error generating outfit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate outfit: ${errorMessage}`);
    }
  }

  private buildOutfitPrompt(constraints: Record<string, unknown>, availableItems: Array<Record<string, unknown>>): string {
    const { weather, occasion, mood, colors } = constraints;

    let prompt = `You are a fashion stylist creating outfit suggestions from a wardrobe.\n\n`;
    prompt += `Constraints:\n`;
    if (weather) prompt += `- Weather: ${weather}\n`;
    if (occasion) prompt += `- Occasion: ${occasion}\n`;
    if (mood) prompt += `- Mood/Vibe: ${mood}\n`;
    if (colors && Array.isArray(colors)) prompt += `- Preferred colors: ${colors.join(', ')}\n`;
    
    prompt += `\nAvailable items:\n`;
    availableItems.forEach((item, idx) => {
      const itemColors = Array.isArray(item.colors) ? item.colors.join(', ') : 'N/A';
      const itemStyle = Array.isArray(item.style) ? item.style.join(', ') : 'N/A';
      prompt += `${idx + 1}. ID: ${item.id}, Category: ${item.category}, Colors: ${itemColors}, Style: ${itemStyle}\n`;
    });

    prompt += `\nCreate 1-3 outfit combinations. For each outfit:\n`;
    prompt += `1. List the item IDs to combine\n`;
    prompt += `2. Explain why this outfit works for the constraints\n`;
    prompt += `3. Give a confidence score (0-1)\n\n`;
    prompt += `Format your response as JSON with this structure:\n`;
    prompt += `{ "outfits": [{ "items": ["id1", "id2"], "reasoning": "...", "confidence": 0.9 }] }`;

    return prompt;
  }

  private parseOutfitResponse(response: string, availableItems: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(response);
      return parsed.outfits || [];
    } catch {
      // Fallback: return a simple outfit if parsing fails
      console.warn('Failed to parse outfit response, returning fallback');
      return [{
        items: availableItems.slice(0, 3).map(item => item.id),
        reasoning: 'Automatically generated combination based on available items',
        confidence: 0.5,
      }];
    }
  }
}

// Export singleton instance
export const twinStyleAgent = new TwinStyleAgent();
