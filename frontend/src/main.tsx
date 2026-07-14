import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import { GlobalNotificationProvider } from "./components/ui/GlobalNotificationProvider";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ThemeProvider } from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GlobalNotificationProvider>
            <App />
          </GlobalNotificationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
