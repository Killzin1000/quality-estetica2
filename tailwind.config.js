/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Incluindo pasta components na raiz por segurança
    ],
    theme: {
        extend: {
            colors: {
                // Fundos (Foco em redução de cansaço visual)
                background: '#0a0a0a', // Preto fosco profundo
                surface: '#121212',    // Mesas e containers
                'surface-highlight': '#1E1E1E', // Hover states

                // Dourado (Acentos luxuosos)
                gold: {
                    100: '#F9F1D8', // Texto claro sobre dourado
                    200: '#F0E3B4',
                    300: '#E6D590',
                    400: '#DCC76C',
                    500: '#D4AF37', // Gold clássico (Primary Brand)
                    600: '#AA8C2C', // Hover states
                    700: '#806921',
                    800: '#554616',
                    900: '#2B230B', // Backgrounds tintados de dourado
                },

                // Funcionais (Status)
                success: '#10B981', // Emerald
                error: '#EF4444',   // Red
                text: {
                    primary: '#FAFAFA',   // Quase branco
                    secondary: '#A1A1AA', // Cinza neutro
                    muted: '#52525B',     // Desabilitados
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
