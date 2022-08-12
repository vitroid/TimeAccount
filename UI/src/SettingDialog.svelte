<script lang="ts">
	// import { theme } from "./color";
	// import DarkMode from "svelte-dark-mode";
	import ColorSelector from "./ColorSelector.svelte";
	import ToggleDark from './Components/ToggleDark.svelte';

	let theme
	$: switchTheme = theme === "dark" ? "light" : "dark";
</script>

<ToggleDark />

<ColorSelector />

<style>
	:root{
		--bg-color: #FFFFFF;
		--text-color: #000000;
	}
	:global(body) {
		background-color: var(--bg-color);
		color: var(--text-color);
		transition: background-color 0.3s;
		--shadow-color: #0003;
	}
	:global(body.dark) {
		--bg-color: #1d3040;
		--text-color: #bfc2c7;
		--shadow-color: #fff3;
	}
</style>
