<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);
</script>

<style>
	button {
		border-bottom: 3px solid #5ab4bd;
		font-size: 16px;
		height: 40px;
		/* width: 100px; */
		color: #565656;
		background-color: #d9d9d9;
		transition: all 0.2s ease;

		/* background: none; */
		border: none;
		/* border-bottom: 2px solid white; */
		border-radius: 0;
		margin: 0;
		padding: 5px;
		/* color: #ccc; */
	}
	
	.selected {
		/* border-bottom: 2px solid teal;
		color: #333; */
		background-color: #5ab4bd;
	    color: #fff;
	}
	button:hover {
		opacity: 0.75;
	}
</style>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>