# Spanish → English Translator - User Guide

## Overview

This Canva app translates Spanish text elements to English with a professional review workflow. Perfect for translating documents, presentations, and designs.

## Complete Workflow

### 1. Setup Stage

**What to do:**
- Open your Canva design with Spanish text
- Launch the "Spanish → English Translator" app from the side panel
- Select the text elements you want to translate
  - Press `Ctrl/Cmd + A` to select all text elements
  - Or manually select specific elements

**What you'll see:**
- The app displays: "✓ Selected X text element(s)"
- "Translate to English" button becomes enabled

### 2. Translation Stage

**What happens:**
- Click **"Translate to English"**
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
- 🇪🇸 **Spanish (Original)** - Read-only multiline field
- 🇺🇸 **English Translation** - Editable multiline field (3-8 rows)
- ☐ **✓ Reviewed & approved** - Checkbox

**What to do:**
1. Read the automatic translation
2. Edit if needed (click in the English field)
3. Check "✓ Reviewed & approved" when satisfied
4. Repeat for all items

**Progress tracking:**
- Progress shown at bottom: "2/5 done"
- "Apply Translations" button is disabled until all items are reviewed

### 4. Apply Stage

**What happens:**
- Click **"Apply Translations"** (only enabled when all items reviewed)
- Original Spanish text is backed up automatically
- Text elements are replaced with English translations
- Changes are saved to your Canva design
- You're moved to the Finalize stage

### 5. Finalize Stage

**What you'll see:**
- Success message: "✓ X text element(s) translated"
- Before & After comparison cards showing:
  - 🇪🇸 Original Spanish text
  - 🇺🇸 Translated English text

**Your options:**

#### Option 1: Undo Changes
- Click **"↩ Undo Changes"** button
- **Important:** Keep the same text elements selected
- Restores original Spanish text
- Original translations are preserved for re-editing

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

**Why?** The undo function needs to read a fresh draft from your selection to restore the Spanish text.

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

The app uses MyMemory, a free translation service:

**Pros:**
- ✅ No API key required
- ✅ Free to use
- ✅ Reliable (99.9% uptime)
- ✅ Good quality for Spanish ↔ English

**Limits:**
- 500 characters per text element
- 10,000 words per day (free tier)
- ~100 requests per minute

**Quality tips:**
- Review all translations manually
- Edit for tone and context
- Check for proper names (may be mistranslated)
- Verify technical terms

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

Planned enhancements:
- Translation memory (remember previous translations)
- Custom glossaries (your own term dictionary)
- Multiple language pairs (not just Spanish → English)
- Batch design processing (translate multiple designs at once)
- Premium API integration (DeepL, Google Translate for better quality)

## Getting Help

- **Canva Apps SDK Docs:** [canva.dev/docs/apps](https://www.canva.dev/docs/apps/)
- **MyMemory API Docs:** [mymemory.translated.net/doc](https://mymemory.translated.net/doc)

## Quick Reference

| Stage | Action | Button |
|-------|--------|--------|
| Setup | Select text | n/a |
| Setup | Start translation | "Translate to English" |
| Review | Edit translation | Click in text field |
| Review | Approve item | Check ✓ box |
| Review | Cancel | "Cancel" |
| Apply | Save to design | "Apply Translations" |
| Finalize | Restore Spanish | "↩ Undo Changes" |
| Finalize | Start over | "New Translation" |

---

**Success!** You now have a professional tool for translating Spanish documents to English within Canva.
