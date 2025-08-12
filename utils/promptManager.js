const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class PromptManager {
    constructor() {
        this.promptsDir = path.join(__dirname, '..', 'prompts');
        this.promptFiles = {
            imageEnhancePrompt: 'image-enhance-prompt.md',
            imageCaptionPrompt: 'image-caption-prompt.md',
            videoEnhancePrompt: 'video-enhance-prompt.md',
            videoCaptionPrompt: 'video-caption-prompt.md'
        };
    }

    async loadPrompts() {
        const prompts = {};
        
        for (const [key, filename] of Object.entries(this.promptFiles)) {
            try {
                const filePath = path.join(this.promptsDir, filename);
                const content = await fs.readFile(filePath, 'utf8');
                prompts[key] = content.trim();
            } catch (error) {
                console.error(`Error loading prompt ${filename}:`, error.message);
                prompts[key] = '';
            }
        }
        
        return prompts;
    }

    async savePrompt(promptType, content) {
        if (!this.promptFiles[promptType]) {
            throw new Error(`Unknown prompt type: ${promptType}`);
        }

        const filename = this.promptFiles[promptType];
        const filePath = path.join(this.promptsDir, filename);
        
        try {
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`✅ Saved prompt: ${filename}`);
            
            // Auto-commit to Git
            await this.commitPromptChange(filename);
            
            return true;
        } catch (error) {
            console.error(`Error saving prompt ${filename}:`, error.message);
            throw error;
        }
    }

    async commitPromptChange(filename) {
        try {
            const promptName = filename.replace('.md', '').replace('-', ' ');
            const commitMessage = `update: ${promptName} prompt changed`;
            
            // Add the specific file
            await execAsync(`git add prompts/${filename}`);
            
            // Check if there are changes to commit
            const { stdout: status } = await execAsync('git status --porcelain');
            if (!status.trim()) {
                console.log('No changes to commit');
                return;
            }
            
            // Commit the changes
            await execAsync(`git commit -m "${commitMessage}"`);
            console.log(`🚀 Auto-committed: ${commitMessage}`);
            
            // Optional: Push to remote (uncomment if you want auto-push)
            await execAsync('git push origin main');
            console.log('📤 Pushed to remote repository');
            
        } catch (error) {
            console.error('Git commit error:', error.message);
            // Don't throw here - we still want the prompt to be saved even if Git fails
        }
    }

    getPromptDisplayName(promptType) {
        const names = {
            imageEnhancePrompt: 'Image Prompt Generation',
            imageCaptionPrompt: 'Image Caption Generation',
            videoEnhancePrompt: 'Video Prompt Generation',
            videoCaptionPrompt: 'Video Caption Generation'
        };
        return names[promptType] || promptType;
    }
}

module.exports = new PromptManager();