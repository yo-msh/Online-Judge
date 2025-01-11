/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100ch", // add required value here
					},
				},
			},
		},
	},
	daisyui: {
		themes: ["dark", "light"],
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
