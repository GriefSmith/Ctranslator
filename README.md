# Spanish → English Translator for Canva

A Canva app that translates Spanish text elements to English with a professional review workflow.

## Features

- ✅ Automatic Spanish → English translation using MyMemory API
- ✅ Review and edit translations before applying
- ✅ Direct in-place text replacement (no duplicate elements)
- ✅ Undo functionality to restore original Spanish text
- ✅ Before/after comparison view
- ✅ Handles up to 50 text elements at once

## Requirements

- Node.js `v20.10.0` or higher
- npm `v10` or higher

**Note:** Use [nvm](https://github.com/nvm-sh/nvm) to ensure the correct Node version. The `.nvmrc` file in the root directory will ensure the correct version is used once you run `nvm install`.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

   The server becomes available at http://localhost:8080

3. **Preview the app:**
   - Create an app via the [Developer Portal](https://www.canva.com/developers/apps)
   - Select **App source > Development URL**
   - Enter `http://localhost:8080` as the Development URL
   - Click **Preview** to open the Canva editor
   - Click **Open** when the app appears in the side panel

## How to Use

### 1. Setup

- Open a Canva design with Spanish text
- Open the Spanish → English Translator app from the side panel
- Select text elements you want to translate (Ctrl/Cmd + A for all)

### 2. Translate

- Click **"Translate to English"**
- The app will automatically translate all selected text using MyMemory API
- Wait for translation to complete

### 3. Review

- Review each translation in the multiline text fields
- Edit any translations that need adjustment
- Check the "✓ Reviewed & approved" box for each item
- All items must be reviewed before proceeding

### 4. Apply

- Click **"Apply Translations"** to replace the Spanish text with English
- Original Spanish text is automatically backed up for undo

### 5. Finalize

- Review the before/after comparison
- **Undo Changes**: Restore original Spanish text (requires text selection)
- **New Translation**: Start a fresh translation session

## Translation API

The app uses **MyMemory API**, a free translation service:

- ✅ Free to use (no API key required)
- ✅ Reliable (99.9% uptime)
- ✅ Supports 100+ language pairs
- ✅ 500 character limit per request
- ⚠️ Daily quota: 10,000 words/day (free tier)

## Project Structure

```
/Users/doggo/design-translator/
├── src/
│   ├── app.tsx              # Main application logic
│   └── index.tsx            # Entry point
├── utils/
│   └── use_selection_hook.ts # Canva selection hook
├── styles/
│   └── components.css       # App styles
├── scripts/                 # Development scripts
├── package.json             # Dependencies
├── webpack.config.ts        # Build configuration
└── TRANSLATION_GUIDE.md     # Detailed usage guide
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

### Enable Hot Module Replacement (Optional)

1. Navigate to your app in the [Developer Portal](https://www.canva.com/developers/apps)
2. Go to **Security** → **Credentials** → **.env file**
3. Copy the contents to your local `.env` file
4. Restart the development server

Example `.env`:

```bash
CANVA_APP_ORIGIN=https://app-aabbccddeeff.canva-apps.com
CANVA_HMR_ENABLED=true
```

## Limitations

- Maximum 50 text elements per translation session
- 500 character limit per text element (MyMemory API)
- 10,000 words per day (free tier)
- Font styles are preserved by Canva but not explicitly managed by the app
- Requires manual layout adjustment if translated text is longer/shorter

## Tips

- Always review translations for accuracy
- Keep text elements selected during workflow for undo functionality
- Translate in batches if working with large designs
- Check text layout after applying translations

## Future Enhancements

- Translation memory/glossary support
- Multiple language pair support
- Batch processing for multiple designs
- Integration with premium translation APIs (DeepL, Google Translate)

## License

See [LICENSE.md](LICENSE.md) for details.

## Documentation

For detailed usage instructions, see [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md)

For Canva Apps SDK documentation, visit [canva.dev/docs/apps](https://www.canva.dev/docs/apps/)
