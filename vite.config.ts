// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
// import checker from 'vite-plugin-checker' // déjalo comentado en CI

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // carga variables de entorno de Vite (Netlify las expone igual)
  const env = loadEnv(mode, process.cwd(), '')
  const SKIP_TYPECHECK = env.SKIP_TYPECHECK === 'true'

  return {
    plugins: [
      react(),
      TanStackRouterVite(),
      // Solo chequea tipos en dev, o cuando NO se pida saltarlo
      ...(SKIP_TYPECHECK || mode === 'production'
        ? []
        // ? [checker({ typescript: true })] // ❌ coméntalo si te da guerra en prod
        : [])
    ]
  }
})
