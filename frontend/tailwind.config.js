/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6", // Blue 500
                secondary: "#10b981", // Emerald 500
                accent: "#8b5cf6", // Violet 500
                dark: "#1e293b", // Slate 800
                light: "#f8fafc", // Slate 50
            }
        },
    },
    plugins: [],
}
