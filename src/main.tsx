import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ToastContainer } from "react-toastify";

import "./index.css";

import App from "./App.tsx";

import { NavigationLoadingOverlay } from "./components/NavigationLoadingOverlay.tsx";
import { AuthModals } from "./components/AuthModals.tsx";

import { AuthProvider } from "./contexts/AuthContext.tsx";
import { AuthModalProvider } from "./contexts/AuthModalContext.tsx";
import { UploadModalProvider } from "./contexts/UploadModalContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthModalProvider>
            <NavigationLoadingOverlay />

            <UploadModalProvider>
              <App />
            </UploadModalProvider>

            <AuthModals />
          </AuthModalProvider>
        </AuthProvider>

        <ToastContainer
          position="top-right"
          autoClose={3200}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
