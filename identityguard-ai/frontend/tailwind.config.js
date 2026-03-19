/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                ink: '#0f172a',
                mist: '#f5f8ff',
                skyline: '#e8f1ff',
            },
            boxShadow: {
                soft: '0 24px 70px -28px rgba(15, 23, 42, 0.28)',
            },
            animation: {
                float: 'float 8s ease-in-out infinite',
                shimmer: 'shimmer 1.8s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
};
