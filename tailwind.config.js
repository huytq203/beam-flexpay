/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
        extend: {
            keyframes: {
                // shimmer: {
                //     '100%': { left: '100%' }
                // },
                // 'pulse-soft': {
                //     '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                //     '50%': { opacity: '0.6', transform: 'scale(0.9)' }
                // },
                'pulse-dot': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.4', transform: 'scale(0.8)' }
                },
                'ping-slow': {
                    '75%, 100%': {
                        transform: 'scale(2.5)',
                        opacity: '0',
                    },
                }
            },
            animation: {
                shimmer: 'shimmer 3s infinite',
                // 'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }
        }
    },
    plugins: []
}

