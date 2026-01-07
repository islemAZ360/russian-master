/** @type {import('tailwindcss').Config} */
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', '[data-theme="dark"]', "class"],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-cairo)',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'monospace'
  			]
  		},
  		animation: {
  			'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'float': 'float 20s ease-in-out infinite',
            'shimmer': 'shimmer 2s linear infinite',
            'swing': 'swing 2s ease-in-out infinite',
            'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
            shimmer: {
                from: {
                    backgroundPosition: "0 0"
                },
                to: {
                    backgroundPosition: "-200% 0"
                }
            },
            swing: {
                '0%, 100%': { transform: 'rotate(0deg)' },
                '20%': { transform: 'rotate(15deg)' },
                '40%': { transform: 'rotate(-10deg)' },
                '60%': { transform: 'rotate(5deg)' },
                '80%': { transform: 'rotate(-5deg)' },
            },
            'border-beam': {
                '100%': {
                    'offset-distance': '100%'
                }
            }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [addVariablesForColors, require("tailwindcss-animate")],
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({ ":root": newVars });
}