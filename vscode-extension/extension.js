const vscode = require('vscode');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

// Style presets for asset generation
const STYLE_PROMPTS = {
    realistic: 'photorealistic, highly detailed, 8k resolution',
    anime: 'anime style, cel shaded, vibrant colors',
    pixel: 'pixel art style, retro gaming, 16-bit',
    lowpoly: 'low poly 3D style, geometric, minimalist',
    handdrawn: 'hand drawn, sketch style, artistic',
    scifi: 'science fiction, futuristic, high-tech, sleek',
    fantasy: 'fantasy style, magical, mystical, ethereal',
    cyberpunk: 'cyberpunk style, neon, dystopian, high-tech-low-life'
};

// Asset types for generation
const ASSET_TYPES = [
    'character',
    'item',
    'environment',
    'weapon',
    'vehicle',
    'building',
    'creature',
    'prop'
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Register the generate command
    let generateCommand = vscode.commands.registerCommand('cursor-asset-generator.generate', async () => {
        try {
            // Get configuration
            const config = vscode.workspace.getConfiguration('cursor-asset-generator');
            const token = config.get('huggingfaceToken');
            
            if (!token) {
                const setToken = await vscode.window.showErrorMessage(
                    'Hugging Face API token not set. Would you like to set it now?',
                    'Yes',
                    'No'
                );
                
                if (setToken === 'Yes') {
                    vscode.commands.executeCommand('cursor-asset-generator.configure');
                }
                return;
            }

            // Get asset details from user
            const assetType = await vscode.window.showQuickPick(ASSET_TYPES, {
                placeHolder: 'Select asset type'
            });
            
            if (!assetType) return;

            const stylePreset = await vscode.window.showQuickPick(Object.keys(STYLE_PROMPTS), {
                placeHolder: 'Select style preset'
            });
            
            if (!stylePreset) return;

            const prompt = await vscode.window.showInputBox({
                placeHolder: 'Describe your game asset (e.g., "A magical sword with glowing blue runes")',
                prompt: 'Enter asset description'
            });
            
            if (!prompt) return;

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating game asset...",
                cancellable: false
            }, async (progress) => {
                // Generate the asset
                const enhancedPrompt = `${prompt}, ${assetType}, ${STYLE_PROMPTS[stylePreset]}, game asset`;
                
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                    {
                        inputs: enhancedPrompt,
                        parameters: {
                            negative_prompt: "low quality, blurry, bad anatomy, watermark, signature, text"
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer'
                    }
                );

                // Save the generated image
                const outputDir = config.get('outputDirectory');
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                
                if (!workspaceFolder) {
                    throw new Error('No workspace folder open');
                }

                const fullOutputDir = path.join(workspaceFolder.uri.fsPath, outputDir);
                await fs.mkdir(fullOutputDir, { recursive: true });

                const fileName = `${assetType}-${Date.now()}.png`;
                const filePath = path.join(fullOutputDir, fileName);
                
                await fs.writeFile(filePath, response.data);

                // Create metadata file
                const metadata = {
                    prompt,
                    assetType,
                    stylePreset,
                    timestamp: Date.now(),
                    enhancedPrompt,
                    cursorMetadata: {
                        aiGenerated: true,
                        model: "stabilityai/stable-diffusion-xl-base-1.0",
                        category: "game-asset",
                        tags: [assetType, stylePreset]
                    }
                };

                await fs.writeFile(
                    filePath.replace('.png', '.json'),
                    JSON.stringify(metadata, null, 2)
                );

                // Show the generated asset
                const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
                await vscode.window.showTextDocument(document);

                // Add to Cursor AI context
                await vscode.commands.executeCommand('cursor.addToContext', {
                    type: 'game-asset',
                    path: filePath,
                    metadata
                });

                vscode.window.showInformationMessage(`Asset generated successfully: ${fileName}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate asset: ${error.message}`);
        }
    });

    // Register the configure command
    let configureCommand = vscode.commands.registerCommand('cursor-asset-generator.configure', async () => {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Hugging Face API token',
            password: true
        });

        if (token) {
            const config = vscode.workspace.getConfiguration('cursor-asset-generator');
            await config.update('huggingfaceToken', token, true);
            vscode.window.showInformationMessage('API token saved successfully');
        }
    });

    context.subscriptions.push(generateCommand, configureCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}; 