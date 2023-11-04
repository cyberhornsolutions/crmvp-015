import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.REACT_APP_API_KEY": JSON.stringify(
      process.env.VITE_REACT_APP_API_KEY
    ),
    "import.meta.env.REACT_APP_AUTH_DOMAIN": JSON.stringify(
      process.env.VITE_REACT_APP_AUTH_DOMAIN
    ),
    "import.meta.env.REACT_APP_PROJECT_ID": JSON.stringify(
      process.env.VITE_REACT_APP_PROJECT_ID
    ),
    "import.meta.env.REACT_APP_STORAGE_BUCKET": JSON.stringify(
      process.env.VITE_REACT_APP_STORAGE_BUCKET
    ),
    "import.meta.env.REACT_APP_MSG_SENDER_ID": JSON.stringify(
      process.env.VITE_REACT_APP_MSG_SENDER_ID
    ),
    "import.meta.env.REACT_APP_APP_ID": JSON.stringify(
      process.env.VITE_REACT_APP_APP_ID
    ),
  },
});
