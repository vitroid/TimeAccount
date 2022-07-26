<script>
	import Category from "./Category.svelte"
	import Hour from "./Hour.svelte"
	import Minute from "./Minute.svelte"
	import History from "./History.svelte"
	import LogoutComponent from './Components/LogoutComponent.svelte';
    import { cats, getHistory } from './stores.ts'

	import { onMount } from 'svelte';

	onMount(() => {
		getHistory()
	})

	setInterval(() => {
		getHistory()
	}, 60*1000)  // every one minute

	function addCategory() {
		let c = 0
		while ( c in $cats ){
			c ++
		}
		$cats[c] = {}
	}
</script>

<main>
	<LogoutComponent />
	<p>
		<Hour />時<Minute />分以降、何をしていましたか?
	</p>
	{#each Object.keys($cats) as id}
	<Category {id}/>
	{/each}
	<button name="name" on:click={addCategory} >+ New Category</button>
	<History />
</main>

<style>
	p {
		margin: 0;
	}
</style>