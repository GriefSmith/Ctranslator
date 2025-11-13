# Ctranslator - Complete User Guide

## Overview

This Canva app provides bidirectional Spanish ↔ English translation with a professional review workflow. Perfect for translating documents, presentations, designs, and any multilingual content.

**Available Translations:**

- 🇪🇸 Spanish → 🇺🇸 English
- 🇺🇸 English → 🇪🇸 Spanish

## Complete Workflow

### 1. Setup Stage

**What to do:**

- Open your Canva design with text you want to translate
- Launch **Ctranslator** from the Apps panel
- Select the text elements you want to translate
  - Press `Ctrl/Cmd + A` to select all text elements
  - Or manually select specific elements

**What you'll see:**

- The app displays: "✓ Selected X text element(s)"
- Two translation buttons available:
  - **"Translate to English"** (for Spanish text)
  - **"Translate to Spanish"** (for English text)

### 2. Translation Stage

**What happens:**

- Click your desired translation button:
  - **"Translate to English"** - Converts Spanish → English
  - **"Translate to Spanish"** - Converts English → Spanish
- The app automatically translates each selected text element
- Uses MyMemory API (free, no signup required)
- Shows progress during translation
- Handles errors gracefully (skips empty text, shows failures)

**Wait time:**

- ~500ms per element
- 10 elements ≈ 5 seconds
- 50 elements (max) ≈ 25 seconds

### 3. Review Stage

**What you'll see:**
For each translation, a card showing:

- Item number (e.g., "Item 1 of 5")
- **Original Text** - Read-only multiline field (shows source language)
- **Translation** - Editable multiline field (3-8 rows, shows target language)
- ☐ **✓ Reviewed & approved** - Checkbox

**Language Labels:**

- Spanish → English: 🇪🇸 Spanish (Original) → 🇺🇸 English (Translation)
- English → Spanish: 🇺🇸 English (Original) → 🇪🇸 Spanish (Translation)

**What to do:**

1. Read the automatic translation
2. Edit if needed (click in the translation field)
3. Check "✓ Reviewed & approved" when satisfied
4. Repeat for all items

**Progress tracking:**

- Progress shown at bottom: "2/5 done"
- "Apply Translations" button is disabled until all items are reviewed

### 4. Apply Stage

**What happens:**

- Click **"Apply Translations"** (only enabled when all items reviewed)
- Original text is backed up automatically
- Text elements are replaced with translations
- Changes are saved to your Canva design
- You're moved to the Finalize stage

### 5. Finalize Stage

**What you'll see:**

- Success message: "✓ X text element(s) translated"
- Before & After comparison cards showing original and translated text

**Your options:**

#### Option 1: Undo Changes

- Click **"↩ Undo Changes"** button
- **Important:** Keep the same text elements selected
- Restores original text in source language
- Previous translations are preserved for re-editing

#### Option 2: New Translation

- Click **"New Translation"** button
- Clears everything and returns to Setup stage
- Ready to translate different elements or start fresh

## Important Notes

### ⚠️ Undo Requirements

To use "Undo Changes", you **MUST**:

1. Keep the same text elements selected
2. Don't deselect or switch to different elements
3. If you deselect by accident, re-select the same elements (Ctrl/Cmd + A)

**Why?** The undo function needs to read a fresh draft from your selection to restore the original text.

**If you deselect:**

- The "↩ Undo Changes" button becomes disabled
- A warning appears: "⚠ Select the text elements to enable undo"
- Solution: Re-select the same text elements

### ✅ Best Practices

1. **Keep selection active throughout workflow**
   - Select all text at the start
   - Keep it selected until you're done
   - This enables the undo feature

2. **Iterative refinement**

   ```
   Translate → Review → Apply → See results
        ↑                            ↓
        ←────── Undo & Refine ───────┘
   ```

3. **Review carefully**
   - Machine translation isn't perfect
   - Check for context and nuance
   - Edit translations as needed

4. **Large designs**
   - Translate in batches (max 50 elements)
   - Do important text first (headlines, titles)
   - Then do body text separately

## Translation Quality

### MyMemory API

The app uses MyMemory, a trusted free translation service:

**Advantages:**

- ✅ No API key or signup required
- ✅ Completely free to use
- ✅ Reliable (99.9% uptime)
- ✅ High quality for Spanish ↔ English translation
- ✅ Bidirectional support (both directions)

**Usage Limits:**

- 500 characters per text element
- 10,000 words per day (generous free tier)
- ~100 requests per minute

**Tips for Best Quality:**

- Always review translations manually
- Edit for tone, context, and brand voice
- Double-check proper names (may be mistranslated)
- Verify technical or industry-specific terms
- Test with your target audience when possible

### Common Translation Issues

1. **Idiomatic expressions**
   - Spanish idioms may translate literally
   - Edit to use English equivalents

2. **Formal vs informal**
   - "Tú" vs "Usted" context may be lost
   - Adjust formality level as needed

3. **Text length**
   - English text may be longer/shorter than Spanish
   - Check layout after applying translations
   - Manually adjust text boxes if needed

## Error Messages

### "⚠️ Please select text elements"

**Cause:** No text selected
**Fix:** Select text elements using Ctrl/Cmd + A

### "⚠️ Too many elements selected (X). Please select 50 or fewer."

**Cause:** More than 50 elements selected
**Fix:** Translate in smaller batches

### "❌ Translation failed"

**Cause:** Network error or API rate limit
**Fix:** Wait 30 seconds and try again with fewer elements

### "❌ No draft available"

**Cause:** Lost reference to design draft
**Fix:** Restart the translation workflow

## Exporting Your Translated Design

After applying translations:

1. **Download locally:**
   - Go to **File** → **Download**
   - Choose format: PDF, PNG, or JPG

2. **Share with client:**
   - Go to **File** → **Share**
   - Generate a shareable link
   - Or invite collaborators via email

## Keyboard Shortcuts

- `Ctrl/Cmd + A` - Select all text elements
- `Tab` - Move to next field in review
- `Space` - Toggle checkbox
- `Ctrl/Cmd + Enter` - Submit (when button is focused)

## Troubleshooting

### Translations look wrong

- This is normal - machine translation isn't perfect
- Use the review stage to edit translations
- This is why manual review is required

### Can't undo changes

- Make sure the text elements are still selected
- Select them again with Ctrl/Cmd + A
- If you closed the design, you can't undo

### Some elements weren't translated

- Check if they were skipped due to empty text
- Look at the success message: "Translated X/Y elements (Z failed)"
- Failed elements keep their original text

### Layout looks broken after translation

- English text may be longer/shorter than Spanish
- Manually adjust text boxes in Canva
- Resize or reposition elements as needed

## Tips for Professional Results

1. **Always review before applying**
   - Never trust machine translation 100%
   - Check every translation manually

2. **Maintain brand voice**
   - Adjust translations to match client's tone
   - Keep terminology consistent

3. **Test with clients**
   - Start with a small section
   - Get feedback before translating entire design

4. **Keep backups**
   - Duplicate your design before translating
   - Use "File → Make a copy" in Canva

5. **Document special terms**
   - Note technical terms or proper names
   - Create a glossary for consistency

## Future Features

We're constantly improving! Planned enhancements:

- 🌐 **Additional Language Pairs**: French, German, Portuguese, Italian, and more
- 🧠 **Translation Memory**: Remember and reuse your previous translations
- 📚 **Custom Glossaries**: Define your own terminology dictionary
- 🎨 **Batch Processing**: Translate multiple designs at once
- 🤖 **AI Integration**: Premium AI-powered translations for enhanced quality
- 💾 **Export/Import**: Save and share translation workflows

## Getting Help

- **App Support**: Contact GriefSmith for bugs or feature requests
- **Canva Help**: [canva.dev/docs/apps](https://www.canva.dev/docs/apps/)
- **Translation API**: [mymemory.translated.net/doc](https://mymemory.translated.net/doc)

## Quick Reference

| Stage    | Action                | Button                 |
| -------- | --------------------- | ---------------------- |
| Setup    | Select text           | n/a                    |
| Setup    | Start Spanish→English | "Translate to English" |
| Setup    | Start English→Spanish | "Translate to Spanish" |
| Review   | Edit translation      | Click in text field    |
| Review   | Approve item          | Check ✓ box            |
| Review   | Cancel workflow       | "Cancel"               |
| Apply    | Save to design        | "Apply Translations"   |
| Finalize | Restore original      | "↩ Undo Changes"      |
| Finalize | Start fresh           | "New Translation"      |

---

**🎉 Success!** You now have a professional bidirectional translation tool for Spanish ↔ English content within Canva. Happy translating!
