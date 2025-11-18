import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { prepareDesignEditor } from "@canva/intents/design";
import { App } from "./app";
import "@canva/app-ui-kit/styles.css";

prepareDesignEditor({
  render: async () => {
    const rootElement = document.getElementById("root");
    const rootElementExists = rootElement instanceof Element;

    if (!rootElementExists) {
      throw new Error("Unable to find element with id of 'root'");
    }

    const root = createRoot(rootElement);

    root.render(
      <AppI18nProvider>
        <AppUiProvider>
          <App />
        </AppUiProvider>
      </AppI18nProvider>,
    );
  },
});

if (module.hot) {
  module.hot.accept("./app", () => {
    prepareDesignEditor({
      render: async () => {
        const rootElement = document.getElementById("root");
        if (rootElement instanceof Element) {
          const root = createRoot(rootElement);
          root.render(
            <AppI18nProvider>
              <AppUiProvider>
                <App />
              </AppUiProvider>
            </AppI18nProvider>,
          );
        }
      },
    });
  });
}
