// Cursor AI Integration
class CursorIntegration {
    constructor() {
        this.projectPath = '';
        this.assetFolder = 'assets/generated';
    }

    // Generate asset metadata for Cursor
    generateMetadata(asset) {
        return {
            name: asset.name,
            type: asset.assetType,
            style: asset.stylePreset,
            prompt: asset.prompt,
            timestamp: asset.timestamp,
            cursorMetadata: {
                aiGenerated: true,
                model: "stabilityai/stable-diffusion-xl-base-1.0",
                category: "game-asset",
                tags: [asset.assetType, asset.stylePreset],
                version: "1.0"
            }
        };
    }

    // Export format for Cursor projects
    generateCursorConfig(assets) {
        return {
            version: "1.0",
            projectType: "game-assets",
            assets: assets.map(asset => ({
                path: `${this.assetFolder}/${asset.name}`,
                metadata: this.generateMetadata(asset),
                preview: asset.imageUrl
            })),
            aiConfig: {
                provider: "huggingface",
                model: "stabilityai/stable-diffusion-xl-base-1.0",
                settings: {
                    negativePrompt: CONFIG.DEFAULT_NEGATIVE_PROMPT,
                    stylePresets: STYLE_PROMPTS
                }
            }
        };
    }

    // Export assets to Cursor project format
    async exportToCursor(assets) {
        try {
            const config = this.generateCursorConfig(assets);
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            const configUrl = URL.createObjectURL(blob);
            
            // Create zip file with assets and config
            const zip = new JSZip();
            
            // Add config file
            zip.file('cursor-assets.json', await (await fetch(configUrl)).blob());
            
            // Add assets
            for (const asset of assets) {
                const assetBlob = await (await fetch(asset.imageUrl)).blob();
                zip.file(`${this.assetFolder}/${asset.name}`, assetBlob);
            }
            
            // Generate and download zip
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = 'cursor-game-assets.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(configUrl);
            URL.revokeObjectURL(zipUrl);
            
            return true;
        } catch (error) {
            console.error('Error exporting to Cursor:', error);
            throw error;
        }
    }

    // Import Cursor project settings
    async importFromCursor(configFile) {
        try {
            const config = JSON.parse(await configFile.text());
            
            if (config.aiConfig?.settings?.stylePresets) {
                // Import style presets
                Object.assign(STYLE_PROMPTS, config.aiConfig.settings.stylePresets);
                this.updateStylePresets();
            }
            
            if (config.assets) {
                // Import assets
                for (const asset of config.assets) {
                    if (asset.preview) {
                        app.addToHistory({
                            imageUrl: asset.preview,
                            prompt: asset.metadata.prompt,
                            assetType: asset.metadata.type,
                            stylePreset: asset.metadata.style,
                            timestamp: asset.metadata.timestamp,
                            name: asset.metadata.name
                        });
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error importing from Cursor:', error);
            throw error;
        }
    }

    // Update UI with imported style presets
    updateStylePresets() {
        const select = document.getElementById('stylePreset');
        select.innerHTML = Object.entries(STYLE_PROMPTS)
            .map(([value, label]) => `<option value="${value}">${label}</option>`)
            .join('');
    }
} 