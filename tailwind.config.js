/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
        extend: {
            keyframes: {
                shimmer: {
                    '100%': { left: '100%' }
                }
            },
            animation: {
                shimmer: 'shimmer 3s infinite'
            }
        }
    },
    plugins: []
}

