# Prompt Management & Auto-Commit System

This project includes an automated system for managing AI prompts with automatic Git commits.

## How It Works

When system prompts are updated through the web interface or API, the system automatically:

1. **Saves the prompt** to the appropriate file in the `prompts/` directory
2. **Commits the change** to Git with a descriptive message
3. **Updates the in-memory cache** for immediate use

## Prompt Files

- `prompts/enhance-prompt.md` - System prompt for enhancing user input prompts
- `prompts/caption-prompt.md` - System prompt for generating Instagram captions

## Auto-Commit Messages

The system generates commit messages in the format:
```
update: <prompt name> prompt changed
```

Examples:
- `update: enhance prompt prompt changed`
- `update: caption prompt prompt changed`

## API Endpoints

### GET /api/system-prompts
Returns all current system prompts loaded from files.

### POST /api/system-prompts
Updates system prompts and automatically commits changes.

**Request Body:**
```json
{
  "enhancePrompt": "Updated enhance prompt content...",
  "captionPrompt": "Updated caption prompt content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "System prompts updated successfully",
  "updatedPrompts": ["Enhance Prompt"]
}
```

## Features

- ✅ **File-based storage** - Prompts are stored in markdown files for easy editing
- ✅ **Automatic Git commits** - Changes are automatically committed with descriptive messages
- ✅ **Real-time updates** - Changes take effect immediately without server restart
- ✅ **Error handling** - Graceful handling of Git errors (prompt still saves if Git fails)
- ✅ **Selective updates** - Only specified prompts are updated and committed

## Manual Editing

You can also manually edit the prompt files in the `prompts/` directory. The server will load the latest content from files when the API is called.

## Git Integration

The system uses the local Git repository and requires:
- Git to be installed and configured
- The project to be in a Git repository
- Proper Git user configuration for commits

## Optional: Auto-Push

To enable automatic pushing to remote repository, uncomment these lines in `utils/promptManager.js`:
```javascript
// await execAsync('git push origin main');
// console.log('📤 Pushed to remote repository');
```