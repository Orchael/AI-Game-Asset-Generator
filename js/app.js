// Constants and Configuration
const CONFIG = {
    API_ENDPOINT: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    MAX_HISTORY: 50,
    STORAGE_KEY: 'gameAssetGeneratorHistory',
    SETTINGS_KEY: 'gameAssetGeneratorSettings',
    DEFAULT_NEGATIVE_PROMPT: 'low quality, blurry, bad anatomy, watermark, signature, text',
    VERSION: '1.1.0'
};

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

const EXAMPLE_PROMPTS = [
    "A mystical staff with floating crystals and ethereal energy",
    "A futuristic hover bike with neon accents",
    "A medieval castle with dragon-themed architecture",
    "A cyberpunk samurai warrior with glowing armor",
    "A magical potion bottle with swirling rainbow liquid",
    "An ancient tree with glowing runes carved into its bark",
    "A steampunk mechanical dragon with brass gears",
    "A crystal cave with bioluminescent plants"
];

// State Management
class AppState {
    constructor() {
        this.history = this.loadHistory();
        this.settings = this.loadSettings();
        this.currentToken = this.settings.apiToken || '';
        this.isGenerating = false;
        this.cursorIntegration = null;
    }

    loadHistory() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    loadSettings() {
        const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
        return saved ? JSON.parse(saved) : {
            apiToken: '',
            defaultStyle: 'realistic',
            defaultAssetType: 'character',
            autoSave: true,
            darkMode: true,
            quality: 'high'
        };
    }

    saveHistory() {
        if (this.history.length > CONFIG.MAX_HISTORY) {
            this.history = this.history.slice(0, CONFIG.MAX_HISTORY);
        }
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.history));
    }

    saveSettings() {
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(this.settings));
        showNotification('Settings saved successfully', 'success');
    }

    addToHistory(item) {
        // Generate a unique name for the asset
        item.name = `${item.assetType}-${Date.now()}.png`;
        
        this.history.unshift(item);
        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear your generation history?')) {
            this.history = [];
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            this.renderHistory();
            showNotification('History cleared successfully', 'success');
        }
    }

    filterHistory(type = 'all') {
        const filteredHistory = type === 'all' 
            ? this.history 
            : this.history.filter(item => item.assetType === type);
        
        this.renderHistory(filteredHistory);
    }

    renderHistory(items = this.history) {
        const historyGrid = document.getElementById('historyGrid');
        historyGrid.innerHTML = '';
        
        items.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'relative group card-hover';
            historyItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.prompt}" class="w-full h-32 object-cover rounded-lg cursor-pointer">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div class="flex space-x-2">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm" onclick="app.reuse(${index})">
                            <i class="fas fa-redo mr-1"></i>Reuse
                        </button>
                        <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm" onclick="app.removeFromHistory(${index})">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 rounded-b-lg">
                    <p class="text-xs text-white truncate">${item.prompt}</p>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-xs text-gray-300">${item.assetType}</span>
                        <span class="text-xs text-gray-300">${item.stylePreset}</span>
                    </div>
                </div>
            `;
            historyGrid.appendChild(historyItem);
        });

        document.getElementById('history').classList.toggle('hidden', items.length === 0);
    }

    removeFromHistory(index) {
        this.history.splice(index, 1);
        this.saveHistory();
        this.renderHistory();
    }

    reuse(index) {
        const item = this.history[index];
        document.getElementById('prompt').value = item.prompt;
        document.getElementById('assetType').value = item.assetType;
        document.getElementById('stylePreset').value = item.stylePreset;
        updateCharCount();
    }

    exportHistory() {
        const exportData = {
            version: CONFIG.VERSION,
            timestamp: Date.now(),
            history: this.history,
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-assets-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importHistory(file) {
        try {
            const content = await file.text();
            const data = JSON.parse(content);
            
            if (data.version && data.history) {
                this.history = [...data.history, ...this.history];
                this.saveHistory();
                this.renderHistory();
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.saveSettings();
                }
                
                showNotification('History imported successfully', 'success');
            } else {
                throw new Error('Invalid export file format');
            }
        } catch (error) {
            showNotification('Failed to import history', 'error');
            console.error(error);
        }
    }
}

// UI Functions
function togglePasswordVisibility() {
    const apiToken = document.getElementById('apiToken');
    const toggleBtn = document.getElementById('toggleToken');
    if (apiToken.type === 'password') {
        apiToken.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        apiToken.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function updateCharCount() {
    const prompt = document.getElementById('prompt');
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${prompt.value.length}/500`;
}

function setRandomPrompt() {
    const prompt = document.getElementById('prompt');
    prompt.value = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    updateCharCount();
}

// Asset Generation
async function generateAsset() {
    if (app.isGenerating) return;

    const apiToken = document.getElementById('apiToken').value;
    const prompt = document.getElementById('prompt').value;
    const assetType = document.getElementById('assetType').value;
    const stylePreset = document.getElementById('stylePreset').value;
    
    if (!apiToken || !prompt) {
        showNotification(
            !apiToken ? 'Please enter your Hugging Face API token' : 'Please enter a description',
            'error'
        );
        return;
    }

    app.isGenerating = true;
    toggleLoadingState(true);
    
    try {
        const enhancedPrompt = `${prompt}, ${assetType}, ${STYLE_PROMPTS[stylePreset]}, game asset`;
        
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: enhancedPrompt,
                parameters: {
                    negative_prompt: CONFIG.DEFAULT_NEGATIVE_PROMPT,
                }
            })
        });
        
        if (!response.ok) throw new Error('Generation failed');
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        displayResult(imageUrl);
        
        app.addToHistory({
            prompt,
            assetType,
            stylePreset,
            imageUrl,
            timestamp: Date.now()
        });

        // Save API token if auto-save is enabled
        if (app.settings.autoSave && apiToken !== app.settings.apiToken) {
            app.settings.apiToken = apiToken;
            app.saveSettings();
        }

        showNotification('Asset generated successfully!', 'success');
    } catch (error) {
        console.error(error);
        showNotification('Generation failed. Please check your API token and try again.', 'error');
    } finally {
        app.isGenerating = false;
        toggleLoadingState(false);
    }
}

// UI Helpers
function toggleLoadingState(isLoading) {
    document.getElementById('loading').classList.toggle('hidden', !isLoading);
    document.getElementById('generateBtn').disabled = isLoading;
}

function displayResult(imageUrl) {
    const generatedImage = document.getElementById('generatedImage');
    generatedImage.src = imageUrl;
    document.getElementById('result').classList.remove('hidden');
    
    // Setup download button
    document.getElementById('downloadBtn').onclick = () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `game-asset-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg glass-effect text-white flex items-center space-x-2 ${
        type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} mr-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize
const app = new AppState();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Setup basic UI interactions
    document.getElementById('toggleToken').addEventListener('click', togglePasswordVisibility);
    document.getElementById('prompt').addEventListener('input', updateCharCount);
    document.getElementById('randomPrompt').addEventListener('click', setRandomPrompt);
    document.getElementById('generateBtn').addEventListener('click', generateAsset);
    document.getElementById('regenerateBtn').addEventListener('click', generateAsset);
    document.getElementById('clearHistory').addEventListener('click', () => app.clearHistory());
    document.getElementById('exportHistory').addEventListener('click', () => app.exportHistory());
    
    // Setup history filtering
    document.getElementById('historyFilter').addEventListener('change', (e) => {
        app.filterHistory(e.target.value);
    });
    
    // Initialize UI state
    updateCharCount();
    app.renderHistory();
    
    // Load saved API token if available
    if (app.settings.apiToken) {
        document.getElementById('apiToken').value = app.settings.apiToken;
    }
    
    // Setup settings
    document.getElementById('saveSettings').addEventListener('click', () => {
        app.settings.apiToken = document.getElementById('apiToken').value;
        app.saveSettings();
    });
}); 