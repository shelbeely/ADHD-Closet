/**
 * Example A2A Workflows
 * 
 * Pre-defined workflows that demonstrate sequential agent chaining.
 */

import { SequentialWorkflow } from './orchestrator';

/**
 * Workflow: Upload → Process → Categorize → Generate Outfit
 * 
 * This workflow demonstrates a complete end-to-end process:
 * 1. Generate catalog image from uploaded photo
 * 2. Infer item attributes from the catalog image
 * 3. Generate outfit suggestions using the categorized item
 */
export const uploadToOutfitWorkflow: SequentialWorkflow = {
  name: 'upload-to-outfit',
  description: 'Complete workflow from image upload to outfit suggestions',
  steps: [
    {
      agentUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' + '/api/a2a',
      skillName: 'generate_catalog_image',
      mapInput: (previousOutput, context) => ({
        imageBase64: context.originalImageBase64,
      }),
    },
    {
      agentUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' + '/api/a2a',
      skillName: 'infer_item_attributes',
      mapInput: (previousOutput, context) => ({
        imageBase64: context.originalImageBase64,
        userPrompt: context.userPrompt || '',
      }),
      validateOutput: (output) => {
        return output.category && output.category !== 'uncategorized';
      },
    },
    {
      agentUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' + '/api/a2a',
      skillName: 'generate_outfit',
      mapInput: (previousOutput, context) => {
        // Create a new item object from the inferred attributes
        const newItem = {
          id: context.itemId || 'new-item',
          category: previousOutput.category,
          colors: previousOutput.colors,
          style: previousOutput.style,
        };

        // Combine with existing available items
        const availableItems = [newItem, ...(context.availableItems || [])];

        return {
          constraints: context.constraints || {
            weather: 'moderate',
            occasion: 'casual',
          },
          availableItems,
        };
      },
    },
  ],
};

/**
 * Workflow: Label Extraction → Item Update
 * 
 * Extracts brand and care information from label photos and updates the item.
 */
export const labelExtractionWorkflow: SequentialWorkflow = {
  name: 'label-extraction',
  description: 'Extract label information and update item metadata',
  steps: [
    {
      agentUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' + '/api/a2a',
      skillName: 'extract_label_info',
      mapInput: (previousOutput, context) => ({
        imageBase64: context.labelImageBase64,
      }),
    },
  ],
};

/**
 * Workflow: Batch Item Processing
 * 
 * Process multiple items in sequence, categorizing each one.
 */
export function createBatchProcessingWorkflow(imageBase64List: string[]): SequentialWorkflow {
  const steps = imageBase64List.map((imageBase64) => ({
    agentUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000' + '/api/a2a',
    skillName: 'infer_item_attributes',
    mapInput: () => ({
      imageBase64,
    }),
  }));

  return {
    name: 'batch-item-processing',
    description: `Process ${imageBase64List.length} items in sequence`,
    steps,
  };
}
