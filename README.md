# Ctranslator - Professional Translation Tool for Canva

Transform your Canva designs with professional Spanish ↔ English translation. Review, edit, and apply translations with confidence using our intelligent workflow.

## ✨ Features

- 🌍 **Bidirectional Translation**: Spanish → English AND English → Spanish
- 🔍 **Review Workflow**: Edit every translation before applying
- 🎯 **In-Place Replacement**: Updates text directly (no duplicate elements)
- ↩️ **Undo Functionality**: Restore original text with one click
- 📊 **Batch Processing**: Translate up to 50 text elements at once
- 🎨 **Format Preservation**: Maintains bullet points and text structure
- 🆓 **Free to Use**: No API keys or subscriptions required

## 🚀 How It Works

1. **Select** text elements in your Canva design
2. **Choose** translation direction (Spanish ↔ English)
3. **Review** and edit automatic translations
4. **Apply** changes to your design
5. **Undo** if needed or start a new translation

## 🎯 Perfect For

- Marketing materials and social media content
- Presentations and documents
- Educational resources
- Business communications
- Creative projects requiring multilingual content

## 🔮 Coming Soon

- 🌐 Additional language pairs (French, German, Portuguese, Italian)
- 🤖 AI-enhanced translations with context awareness
- 💾 Translation memory for consistency
- 📚 Custom glossaries for specialized terminology

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

## 📖 Quick Start Guide

### Getting Started

1. Open your Canva design
2. Find **Ctranslator** in the Apps panel
3. Select text elements you want to translate (Ctrl/Cmd + A for all)

### Translating Your Content

1. **Choose Direction**: Click "Translate to English" or "Translate to Spanish"
2. **Wait**: Automatic translation takes a few seconds
3. **Review**: Check each translation and make edits as needed
4. **Approve**: Mark each translation as reviewed
5. **Apply**: Save all translations to your design

### Making Changes

- **Edit Translations**: Click in any translation field to modify text
- **Undo All Changes**: Use the "Undo Changes" button (keep text selected!)
- **Start Fresh**: Click "New Translation" to begin again

💡 **Pro Tip**: Always keep your text elements selected throughout the workflow to enable undo functionality.

## 🔐 Privacy & Technology

**Translation Service**: We use MyMemory API, a trusted free translation service

- ✅ No sign-up or API keys required
- ✅ Your text is processed securely
- ✅ No data is stored permanently
- ✅ Reliable 99.9% uptime

**Fair Usage**: Free tier includes 10,000 words per day - plenty for most users!

## Project Structure

```
Ctranslator/
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

## ⚠️ Important Notes

**Batch Limits**

- Translate up to 50 text elements at once
- 500 characters per text element
- For larger projects, translate in multiple batches

**After Translation**

- Font styles are preserved automatically
- Text length may change (English/Spanish differ)
- Adjust text boxes manually if needed for perfect layouts

**Best Results**

- Always review translations - machine translation isn't perfect
- Keep text elements selected for undo functionality
- Translate important sections first (headlines, key messages)

## 💡 Tips for Best Results

- **Review Everything**: Machine translation is good but not perfect - always check translations
- **Keep Selection Active**: Don't deselect text elements until you're done (enables undo)
- **Work in Batches**: For large designs, translate sections separately
- **Check Layout**: Adjust text boxes after translation if text length changed
- **Save Often**: Use Canva's auto-save, but consider duplicating your design first

## 🤝 Support & Feedback

Found a bug? Have a feature request? Want to contribute?

- **Developer**: GriefSmith
- **Feedback**: Open to suggestions for improvements
- **Contributing**: PRs welcome on GitHub

## License

See [LICENSE.md](LICENSE.md) for details.

## 📚 Documentation

- **Detailed User Guide**: See [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) for comprehensive instructions
- **Canva Apps**: Learn more at [canva.dev/docs/apps](https://www.canva.dev/docs/apps/)

## ❓ FAQ

**Q: Is my data safe?**
A: Yes! Translations are processed securely via MyMemory API and not stored permanently.

**Q: Can I translate other language pairs?**
A: Currently only Spanish ↔ English. More languages coming soon!

**Q: What if translations look wrong?**
A: Machine translation needs human review - that's why we built the review workflow. Edit any translation before applying.

**Q: Can I undo after closing the design?**
A: No, undo only works in the same session. Always duplicate your design first for safety.

**Q: How many elements can I translate?**
A: Up to 50 text elements per batch. For larger projects, translate in multiple sessions.
