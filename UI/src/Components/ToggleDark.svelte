<script>
	import { darkMode } from './darkmode';

	export function init(){
		if ( $darkMode ){
			window.document.body.classList.add('dark')
		}
		else {
			window.document.body.classList.remove('dark')
		}
	}

	function toggle() {
        $darkMode = !$darkMode;
        window.document.body.classList.toggle('dark');
    }
</script>

<button on:click={toggle}>
	{#if $darkMode }
		Go light
	{:else}
		Go dark
	{/if}
</button>

<style>
	button {
		background: var(--bg-color);
		border: 1px solid var(--text-color);
        color: var(--text-color);
		border-radius: 5px;
		padding: 10px 15px;
	}

	button:active {
		background: inherit;
	}
</style>
