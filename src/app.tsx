import {
  Button,
  Rows,
  Text,
  Title,
  FormField,
  LoadingIndicator,
  Alert,
  Columns,
  Column,
  Box,
  Checkbox,
  MultilineInput,
} from "@canva/app-ui-kit";
import { useSelection } from "utils/use_selection_hook";
import { useState, useCallback, type ReactElement } from "react";
import * as styles from "styles/components.css";

export const DOCS_URL = "https://www.canva.dev/docs/apps/";

// Translation direction type
type TranslationDirection = "es-to-en" | "en-to-es";

// Translation item type
type TranslationItem = {
  id: string;
  originalText: string;
  translatedText: string;
  reviewed: boolean;
  contentIndex: number; // Index in the draft.contents array
};

// Configuration
const MAX_ELEMENTS = 50; // Limit to prevent overwhelming the UI

// Language configuration for each direction
const LANGUAGE_CONFIG = {
  "es-to-en": {
    sourceLang: "es",
    targetLang: "en",
    sourceLabel: "🇪🇸 Spanish",
    targetLabel: "🇺🇸 English",
    buttonText: "Translate to English",
    translatingText: "Translating to English...",
  },
  "en-to-es": {
    sourceLang: "en",
    targetLang: "es",
    sourceLabel: "🇺🇸 English",
    targetLabel: "🇪🇸 Spanish",
    buttonText: "Translate to Spanish",
    translatingText: "Translating to Spanish...",
  },
} as const;

// Bullet characters that indicate list items
const BULLET_PATTERNS = /^[\s]*[•\-*\u2022\u2023\u25E6\u2043\u2219]\s+/m;

/**
 * Checks if text contains bulleted list formatting
 */
const hasBulletFormatting = (text: string): boolean => {
  return BULLET_PATTERNS.test(text);
};

/**
 * Cleans text while preserving bullet formatting and newlines
 * - Preserves newlines for bulleted lists
 * - Removes excessive consecutive spaces but keeps single spaces
 * - Trims only leading/trailing whitespace, not internal structure
 */
const cleanTextPreservingFormatting = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return "";
  }

  const hasBullets = hasBulletFormatting(text);

  if (hasBullets) {
    // For bulleted lists, preserve newlines and bullet structure
    // Only clean up excessive spaces within lines
    return text
      .split("\n")
      .map((line) => {
        // Preserve bullet markers and clean up excessive spaces within the line
        return line.replace(/[ \t]+/g, " ").trimEnd();
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
      .trim();
  } else {
    // For regular text, preserve newlines but clean up excessive spaces
    return text
      .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
      .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
      .trim();
  }
};

/**
 * Formats text for display, preserving bullet points and line breaks
 * Returns an array of JSX elements that can be rendered
 */
const formatTextForDisplay = (text: string): ReactElement[] => {
  if (!text) {
    return [<Text key="empty" size="small" />];
  }

  const lines = text.split("\n");
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      // Empty line - render as spacing
      return (
        <Text key={index} size="small">
          {" "}
        </Text>
      );
    }
    // Check if line starts with a bullet
    const bulletMatch = trimmed.match(
      /^([•\-*\u2022\u2023\u25E6\u2043\u2219])\s*(.*)$/,
    );
    if (bulletMatch) {
      // Render bullet point with proper spacing
      return (
        <Text key={index} size="small">
          {bulletMatch[1]} {bulletMatch[2]}
        </Text>
      );
    }
    // Regular text line
    return (
      <Text key={index} size="small">
        {trimmed}
      </Text>
    );
  });
};

/**
 * Restores bullet formatting in translated text by matching structure
 * If original had bullets, ensures translated text maintains similar structure
 */
const restoreBulletFormatting = (
  originalText: string,
  translatedText: string,
): string => {
  if (!hasBulletFormatting(originalText)) {
    return translatedText;
  }

  // Split original into lines to understand structure (preserve all lines including empty ones)
  const originalLines = originalText.split("\n");
  const translatedLines = translatedText.split("\n");

  // If translation already has bullets preserved, return as-is
  const hasPreservedBullets = translatedLines.some((line) =>
    BULLET_PATTERNS.test(line),
  );
  if (hasPreservedBullets) {
    return translatedText;
  }

  // Extract bullet markers and structure from original (preserve line structure)
  const originalStructure: {
    marker: string;
    text: string;
    isEmpty: boolean;
  }[] = [];
  originalLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      originalStructure.push({ marker: "", text: "", isEmpty: true });
    } else {
      const match = line.match(
        /^[\s]*([•\-*\u2022\u2023\u25E6\u2043\u2219])\s*(.*)$/,
      );
      if (match) {
        originalStructure.push({
          marker: match[1],
          text: match[2],
          isEmpty: false,
        });
      } else {
        // Non-bullet line with content
        originalStructure.push({ marker: "", text: trimmed, isEmpty: false });
      }
    }
  });

  // Get non-empty translated lines for mapping
  const translatedContentLines = translatedLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // If we have bullet structure, restore it
  if (originalStructure.length > 0) {
    const result: string[] = [];
    let transIndex = 0;

    originalStructure.forEach((originalItem) => {
      if (originalItem.isEmpty) {
        // Preserve empty lines
        result.push("");
      } else if (originalItem.marker) {
        // This was a bullet point in the original
        if (transIndex < translatedContentLines.length) {
          // Use the translated line and add the bullet marker
          result.push(
            `${originalItem.marker} ${translatedContentLines[transIndex]}`,
          );
          transIndex++;
        } else {
          // No more translated lines, add bullet with empty text
          result.push(`${originalItem.marker} `);
        }
      } else {
        // This was a regular text line (non-bullet)
        if (transIndex < translatedContentLines.length) {
          result.push(translatedContentLines[transIndex]);
          transIndex++;
        } else {
          // No translation available, preserve original structure
          result.push(originalItem.text);
        }
      }
    });

    // Add any remaining translated lines (in case translation has more content)
    while (transIndex < translatedContentLines.length) {
      result.push(translatedContentLines[transIndex]);
      transIndex++;
    }

    return result.join("\n");
  }

  // Fallback: return translated text as-is
  return translatedText;
};

// Translation service using MyMemory (free, no API key required)
const translateText = async (
  text: string,
  sourceLang = "es",
  targetLang = "en",
): Promise<string> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty text cannot be translated");
  }

  // Clean text while preserving formatting (newlines, bullets)
  const cleanText = cleanTextPreservingFormatting(text);

  if (cleanText.length > 500) {
    throw new Error("Text too long (max 500 characters per element)");
  }

  try {
    // Using MyMemory API - free, no key required, better reliability
    // Preserve newlines in the API call by encoding them properly
    const encodedText = encodeURIComponent(cleanText);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Translation API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200) {
      console.error("API Response:", data);
      throw new Error(data.responseDetails || "Translation failed");
    }

    const translatedText = data.responseData?.translatedText || text;

    // Restore bullet formatting if original had bullets
    return restoreBulletFormatting(text, translatedText);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Translation error:", error);
    throw new Error(`Translation failed: ${errorMessage}`);
  }
};

type WorkflowStage = "setup" | "translating" | "review" | "finalize";

export const App = () => {
  const currentSelection = useSelection("plaintext");
  const [stage, setStage] = useState<WorkflowStage>("setup");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Translation direction state (defaults to Spanish → English)
  const [direction, setDirection] = useState<TranslationDirection>("es-to-en");
  // Type for draft returned from selection.read()
  type Draft = {
    contents: readonly { text: string }[];
    save(): Promise<void>;
  };
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null); // Store the draft
  const [originalTexts, setOriginalTexts] = useState<Record<number, string>>(
    {},
  ); // Backup of originals

  // Scan and translate all text in the design
  const scanAndTranslate = useCallback(async () => {
    // Validation
    if (!currentSelection || currentSelection.count === 0) {
      setError("⚠️ Please select text elements in your design to translate");
      return;
    }

    if (currentSelection.count > MAX_ELEMENTS) {
      setError(
        `⚠️ Too many elements selected (${currentSelection.count}). Please select ${MAX_ELEMENTS} or fewer elements.`,
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    setStage("translating");

    try {
      const draft = await currentSelection.read();
      setCurrentDraft(draft); // Store draft for later use

      const translationItems: TranslationItem[] = [];
      let failedCount = 0;

      // Collect and translate all text elements
      for (let i = 0; i < draft.contents.length; i++) {
        const content = draft.contents[i];
        const originalText = content.text;

        // Skip empty or whitespace-only text
        if (!originalText || originalText.trim().length === 0) {
          console.warn(`Skipping empty text at index ${i}`);
          continue;
        }

        try {
          // Translate each text element using current direction
          const config = LANGUAGE_CONFIG[direction];
          const translatedText = await translateText(
            originalText,
            config.sourceLang,
            config.targetLang,
          );

          translationItems.push({
            id: `item-${i}`,
            originalText,
            translatedText,
            reviewed: false,
            contentIndex: i,
          });
        } catch (err) {
          console.error(`Failed to translate item ${i}:`, err);
          failedCount++;
          // Add with original text as fallback
          translationItems.push({
            id: `item-${i}`,
            originalText,
            translatedText: originalText, // Fallback to original
            reviewed: false,
            contentIndex: i,
          });
        }
      }

      if (translationItems.length === 0) {
        setError(
          "⚠️ No valid text found to translate. Please select text elements.",
        );
        setStage("setup");
        return;
      }

      setTranslations(translationItems);
      setStage("review");

      if (failedCount > 0) {
        setSuccessMessage(
          `Translated ${translationItems.length - failedCount}/${translationItems.length} elements (${failedCount} failed)`,
        );
      } else {
        setSuccessMessage(
          `✓ Translated ${translationItems.length} text element(s)`,
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again.";
      setError(`❌ Translation failed: ${errorMessage}`);
      console.error("Translation error:", err);
      setStage("setup");
    } finally {
      setIsProcessing(false);
    }
  }, [currentSelection, direction]);

  // Update a translation
  const updateTranslation = useCallback((id: string, newText: string) => {
    setTranslations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, translatedText: newText } : item,
      ),
    );
  }, []);

  // Toggle reviewed status
  const toggleReviewed = useCallback((id: string) => {
    setTranslations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reviewed: !item.reviewed } : item,
      ),
    );
  }, []);

  // Apply translations to the design by modifying selected elements directly
  const applyTranslations = useCallback(async () => {
    if (!currentDraft) {
      setError(
        "❌ No draft available. Please restart the translation process.",
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Backup original texts before modifying
      const originals: Record<number, string> = {};
      for (const item of translations) {
        const content = currentDraft.contents[item.contentIndex];
        if (content) {
          originals[item.contentIndex] = content.text; // Save original
          content.text = item.translatedText; // Apply translation
        }
      }
      setOriginalTexts(originals);

      // Save all changes back to the design
      await currentDraft.save();

      setStage("finalize");
      setSuccessMessage("✓ Translations applied successfully!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again.";
      setError(`❌ Failed to apply translations: ${errorMessage}`);
      console.error("Apply error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [translations, currentDraft]);

  // Undo translations - simply restore original Spanish text
  const undoTranslations = useCallback(async () => {
    if (Object.keys(originalTexts).length === 0) {
      setError("❌ No original text available to restore.");
      return;
    }

    if (!currentSelection || currentSelection.count === 0) {
      setError("❌ Please select the same text elements to undo.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Read a FRESH draft (required by Canva after previous save)
      const freshDraft = await currentSelection.read();

      // Restore original Spanish text
      for (const [indexStr, originalText] of Object.entries(originalTexts)) {
        const index = parseInt(indexStr, 10);
        const content = freshDraft.contents[index];
        if (content) {
          content.text = originalText;
        }
      }

      // Save restored text back to design
      await freshDraft.save();

      setSuccessMessage(
        "✓ Reverted to original Spanish text. Re-select and translate again if needed.",
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again.";
      setError(`❌ Failed to undo: ${errorMessage}`);
      console.error("Undo error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [currentSelection, originalTexts]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setStage("setup");
    setTranslations([]);
    setCurrentDraft(null);
    setOriginalTexts({});
    setError(null);
    setSuccessMessage(null);
  }, []);

  const isTextSelected = currentSelection && currentSelection.count > 0;
  const allReviewed =
    translations.length > 0 && translations.every((t) => t.reviewed);

  // Get current language configuration
  const langConfig = LANGUAGE_CONFIG[direction];

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Title size="medium">Ctranslator</Title>

        <Text>
          Professional bidirectional translation tool for Canva designs.
          Currently supports Spanish ↔ English with intelligent review
          workflow.
        </Text>

        {error && <Alert tone="critical">{error}</Alert>}
        {successMessage && <Alert tone="positive">{successMessage}</Alert>}

        {/* Setup Stage */}
        {stage === "setup" && (
          <>
            <Box paddingY="1u">
              <Rows spacing="2u">
                <Rows spacing="1u">
                  <Text tone="tertiary" size="small">
                    Translation Direction:
                  </Text>
                  <Columns spacing="1u">
                    <Column>
                      <Button
                        variant={
                          direction === "es-to-en" ? "primary" : "secondary"
                        }
                        onClick={() => setDirection("es-to-en")}
                        stretch
                      >
                        🇪🇸 → 🇺🇸
                      </Button>
                    </Column>
                    <Column>
                      <Button
                        variant={
                          direction === "en-to-es" ? "primary" : "secondary"
                        }
                        onClick={() => setDirection("en-to-es")}
                        stretch
                      >
                        🇺🇸 → 🇪🇸
                      </Button>
                    </Column>
                  </Columns>
                </Rows>
                <Text>
                  {isTextSelected
                    ? `✓ Selected ${currentSelection.count} text element(s)`
                    : "⚠ Select text elements in your design to begin"}
                </Text>
              </Rows>
            </Box>

            <Button
              variant="primary"
              onClick={scanAndTranslate}
              disabled={!isTextSelected || isProcessing}
              stretch
            >
              {isProcessing
                ? langConfig.translatingText
                : langConfig.buttonText}
            </Button>
          </>
        )}

        {/* Review Stage */}
        {stage === "review" && (
          <>
            <Title size="small">
              Review {langConfig.targetLabel} Translations
            </Title>
            <Text size="small" tone="tertiary">
              Review and edit each translation. Use multiline fields for longer
              text.
            </Text>

            <Box paddingY="1u">
              <Rows spacing="2u">
                {translations.map((item, index) => (
                  <Box
                    key={item.id}
                    padding="2u"
                    background="neutralLow"
                    borderRadius="standard"
                  >
                    <Rows spacing="1.5u">
                      <Text size="small" tone="tertiary">
                        Item {index + 1} of {translations.length}
                      </Text>

                      <FormField
                        label={`${langConfig.sourceLabel} (Original)`}
                        value={item.originalText}
                        control={(props) => (
                          <MultilineInput
                            {...props}
                            disabled
                            minRows={2}
                            maxRows={6}
                          />
                        )}
                      />

                      <FormField
                        label={`${langConfig.targetLabel} Translation ${item.reviewed ? "✓" : ""}`}
                        value={item.translatedText}
                        control={(props) => (
                          <MultilineInput
                            {...props}
                            onChange={(value) =>
                              updateTranslation(item.id, value)
                            }
                            minRows={3}
                            maxRows={8}
                            placeholder="Edit translation here..."
                          />
                        )}
                      />

                      <Checkbox
                        label="✓ Reviewed & approved"
                        checked={item.reviewed}
                        onChange={() => toggleReviewed(item.id)}
                      />
                    </Rows>
                  </Box>
                ))}
              </Rows>
            </Box>

            <Columns spacing="1u">
              <Column>
                <Button variant="secondary" onClick={resetWorkflow} stretch>
                  Cancel
                </Button>
              </Column>
              <Column>
                <Button
                  variant="primary"
                  onClick={applyTranslations}
                  disabled={isProcessing || !allReviewed}
                  stretch
                >
                  {isProcessing ? "Applying..." : "Apply Translations"}
                </Button>
              </Column>
            </Columns>

            <Box paddingY="1u">
              {allReviewed ? (
                <Alert tone="positive">
                  ✓ All {translations.length} translation(s) reviewed! Ready to
                  apply.
                </Alert>
              ) : (
                <Alert tone="info">
                  💡 Please review and approve all {translations.length}{" "}
                  translation(s) before applying (
                  {translations.filter((t) => t.reviewed).length}/
                  {translations.length} done)
                </Alert>
              )}
            </Box>
          </>
        )}

        {/* Finalize Stage */}
        {stage === "finalize" && (
          <>
            <Title size="small">Translation Complete!</Title>
            <Text size="small">
              ✓ {translations.length} text element(s) translated and applied to
              your design.
            </Text>

            <Box paddingY="2u">
              <Rows spacing="2u">
                <Title size="xsmall">Before & After Comparison:</Title>
                {translations.map((item, index) => (
                  <Box
                    key={item.id}
                    padding="1.5u"
                    background="neutralLow"
                    borderRadius="standard"
                  >
                    <Rows spacing="1u">
                      <Text size="xsmall" tone="tertiary">
                        Item {index + 1}
                      </Text>
                      <Box>
                        <Text size="small" tone="tertiary">
                          {langConfig.sourceLabel} Original:
                        </Text>
                        <Box paddingTop="0.5u">
                          <Rows spacing="0.5u">
                            {formatTextForDisplay(item.originalText)}
                          </Rows>
                        </Box>
                      </Box>
                      <Box>
                        <Text size="small" tone="tertiary">
                          {langConfig.targetLabel} Translated:
                        </Text>
                        <Box paddingTop="0.5u">
                          <Rows spacing="0.5u">
                            {formatTextForDisplay(item.translatedText)}
                          </Rows>
                        </Box>
                      </Box>
                    </Rows>
                  </Box>
                ))}
              </Rows>
            </Box>

            <Alert tone="info">
              💡 Select the text elements to restore original Spanish text.
            </Alert>

            <Columns spacing="1u">
              <Column>
                <Button
                  variant="secondary"
                  onClick={undoTranslations}
                  disabled={isProcessing || !isTextSelected}
                  stretch
                >
                  {isProcessing ? "Restoring..." : "↩ Undo Changes"}
                </Button>
              </Column>
              <Column>
                <Button variant="primary" onClick={resetWorkflow} stretch>
                  New Translation
                </Button>
              </Column>
            </Columns>

            {!isTextSelected && (
              <Text size="small" tone="tertiary">
                ⚠ Select the text elements to enable undo
              </Text>
            )}

            <Box paddingTop="2u">
              <Text size="small" tone="tertiary">
                To export: Use <strong>File → Download</strong> or{" "}
                <strong>File → Share</strong>
              </Text>
            </Box>
          </>
        )}

        {isProcessing && stage === "translating" && <LoadingIndicator />}
      </Rows>
    </div>
  );
};
