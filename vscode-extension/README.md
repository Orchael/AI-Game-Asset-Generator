# Game Asset Generator for Cursor

A VS Code extension that integrates AI-powered game asset generation directly into Cursor AI. This extension allows you to generate high-quality game assets using natural language descriptions and automatically integrates them into your Cursor AI workflow.

## Detailed Features

### Asset Generation
- **AI-Powered Generation**: Uses Stable Diffusion XL for high-quality assets
- **Multiple Asset Types**: Support for various game asset categories
- **Style Presets**: Pre-configured artistic styles for consistent results
- **Batch Generation**: Generate multiple assets in sequence
- **Custom Prompting**: Fine-tune generation with detailed descriptions

### Cursor AI Integration
- **Automatic Context Addition**: Assets are added to Cursor's AI context
- **Natural Language Control**: Generate assets through conversation
- **Smart Asset Management**: AI-assisted organization and tagging
- **Contextual Awareness**: AI understands your asset library

### Development Features
- **Metadata Generation**: Automatic creation of detailed asset metadata
- **Project Organization**: Structured asset directory management
- **Version Control Friendly**: Generated assets follow VCS best practices
- **Extensible Framework**: Easy to add new styles and asset types

## Detailed Requirements

1. **VS Code Requirements**:
   - VS Code version 1.80.0 or higher
   - Stable internet connection
   - Sufficient disk space for assets

2. **Cursor AI Requirements**:
   - Latest version of Cursor AI installed
   - Properly configured Cursor environment

3. **API Requirements**:
   - Hugging Face account (free)
   - API token with inference permissions
   - Stable internet connection for API calls

4. **System Requirements**:
   - Node.js 14.x or higher
   - npm 6.x or higher
   - 4GB RAM minimum
   - 1GB free disk space

## Step-by-Step Installation

1. **Install the Extension**:
   ```bash
   # Via VS Code
   1. Open VS Code
   2. Press Ctrl+P (Cmd+P on Mac)
   3. Type: ext install cursor-asset-generator
   4. Press Enter

   # Or via command line
   code --install-extension cursor-asset-generator
   ```

2. **Get Hugging Face Token**:
   ```
   1. Go to https://huggingface.co/
   2. Create an account or sign in
   3. Navigate to Settings > Access Tokens
   4. Create a new token with 'inference' permissions
   5. Copy the token
   ```

3. **Configure the Extension**:
   ```
   1. Open VS Code settings (Ctrl+,)
   2. Search for "Cursor Asset Generator"
   3. Enter your Hugging Face token
   4. Configure output directory
   5. Set default style preferences
   ```

## Detailed Usage Guide

### Command Palette Usage

1. **Basic Asset Generation**:
   ```
   1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
   2. Type: "Generate Game Asset"
   3. Select asset type from list
   4. Choose style preset
   5. Enter detailed description
   6. Wait for generation (typically 20-30 seconds)
   ```

2. **Configuration Access**:
   ```
   1. Press Ctrl+Shift+P
   2. Type: "Configure Asset Generator"
   3. Follow the prompts
   ```

### Cursor AI Natural Language Commands

The extension understands various natural language commands. Here are some examples:

1. **Basic Generation**:
   ```
   "Generate a character asset for my game"
   "Create a new weapon asset"
   "Make an environment background"
   ```

2. **Styled Generation**:
   ```
   "Generate a pixel art character"
   "Create an anime-style weapon"
   "Make a realistic environment"
   ```

3. **Detailed Prompts**:
   ```
   "Generate a character: tall warrior with glowing armor and a magic sword"
   "Create a weapon: ancient katana with dragon engravings and blue energy"
   "Make an environment: dark forest with glowing mushrooms and fog"
   ```

4. **Batch Operations**:
   ```
   "Generate 3 weapon assets in pixel art style"
   "Create a set of character portraits in anime style"
   "Make a collection of environment assets in realistic style"
   ```

### Advanced Configuration

#### Output Directory Structure:
```
your-project/
├── assets/
│   ├── generated/
│   │   ├── characters/
│   │   ├── weapons/
│   │   ├── environments/
│   │   └── metadata/
```

#### Metadata JSON Structure:
```json
{
  "asset": {
    "id": "unique-asset-id",
    "name": "asset-name",
    "type": "character",
    "style": "pixel",
    "timestamp": "2023-01-01T00:00:00Z"
  },
  "generation": {
    "prompt": "original prompt",
    "enhancedPrompt": "processed prompt",
    "model": "stabilityai/stable-diffusion-xl-base-1.0",
    "settings": {
      "style": "pixel",
      "negativePrompt": "low quality, blurry..."
    }
  },
  "cursor": {
    "projectId": "project-id",
    "contextId": "context-id",
    "tags": ["character", "pixel"]
  }
}
```

### Best Practices

1. **Prompt Writing**:
   - Be specific and detailed
   - Include important visual elements
   - Mention style preferences
   - Use consistent terminology

2. **Asset Organization**:
   - Use meaningful filenames
   - Maintain folder structure
   - Keep metadata up to date
   - Tag assets appropriately

3. **Version Control**:
   - Commit metadata separately
   - Use .gitignore for large assets
   - Document generation settings
   - Track important assets

### Troubleshooting

1. **Generation Fails**:
   - Check API token validity
   - Verify internet connection
   - Ensure prompt is appropriate
   - Check available disk space

2. **Integration Issues**:
   - Verify Cursor AI installation
   - Check extension settings
   - Restart VS Code
   - Update extension

3. **Quality Issues**:
   - Refine prompt description
   - Adjust style settings
   - Try different presets
   - Use negative prompts

## Extension Settings Reference

```json
{
  "cursor-asset-generator.huggingfaceToken": {
    "type": "string",
    "default": "",
    "description": "Your Hugging Face API token"
  },
  "cursor-asset-generator.outputDirectory": {
    "type": "string",
    "default": "assets/generated",
    "description": "Asset output directory"
  },
  "cursor-asset-generator.defaultStyle": {
    "type": "string",
    "enum": ["realistic", "anime", "pixel", "lowpoly", "handdrawn", "scifi", "fantasy", "cyberpunk"],
    "default": "realistic"
  }
}
```

## Contributing

### Setting Up Development Environment:
```bash
# Clone repository
git clone https://github.com/your-repo/cursor-asset-generator

# Install dependencies
cd cursor-asset-generator
npm install

# Build extension
npm run compile

# Run tests
npm test
```

### Submitting Changes:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support and Resources

- **Documentation**: [Full Documentation](https://github.com/your-repo/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discord**: [Community Server](https://discord.gg/your-server)
- **Updates**: [Changelog](CHANGELOG.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 