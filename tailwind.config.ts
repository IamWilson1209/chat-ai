import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
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
			backgroundColor: {
				container: "hsl(var(--container))",
				"gray-primary": "hsl(var(--gray-primary))",
				"gray-secondary": "hsl(var(--gray-secondary))",
				"gray-tertiary": "hsl(var(--gray-tertiary))",
				"left-panel": "hsl(var(--left-panel))",
				"chat-hover": "hsl(var(--chat-hover))",
				"green-primary": "hsl(var(--green-primary))",
				"green-secondary": "hsl(var(--green-secondary))",
				"top-dashboard-light": "hsl(var(--top-dashboard-light))",
				"left-dashboard": "hsl(var(--left-dashboard))",
				"right-dashboard-light": "hsl(var(--right-dashboard-light))",
				"left-dashboard-dark": "hsl(var(--left-dashboard-dark))",
				"right-dashboard-dark": "hsl(var(--right-dashboard-dark))",
				"green-chat": "hsl(var(--green-chat))",
				"amber-chat": "hsl(var(--amber-chat))",
				"purple-chat": "hsl(var(--purple-chat))",
				"chatgpt-chat": "hsl(var(--chatgpt-chat))",
			},
			backgroundImage: {
				"chat-tile-light": "url('/group-chat-light.jpg')",
				"chat-tile-dark": "url('/group-chat-dark.jpg')",
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundPosition: {
				'top-left': 'top left',
				'top-center': 'top center',
				'top-right': 'top right',
				'center-left': 'center left',
				'center': 'center center',
				'center-right': 'center right',
				'bottom-left': 'bottom left',
				'bottom-center': 'bottom center',
				'bottom-right': 'bottom right',
			},
		}
	},
	// plugins: [require("tailwindcss-animate")],
} satisfies Config;
