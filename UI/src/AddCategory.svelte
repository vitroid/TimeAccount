<script>
	import { cats } from './stores.ts';

	function addCategory() {
		let c = 0
		while ( c in $cats ){
			c ++
		}
		$cats[c] = {}
	}
</script>

<button name="name" on:click={addCategory} >
	+ New Category
</button>

<style>
	button {
        background: var(--bg-color);
		border: none;
        color: var(--text-color);
	}
</style>
