<script>
	import { Tabs, TabList, TabPanel, Tab } from './Components/Tabs/tabs.js';
	import Category from "./Category.svelte"
	import Hour from "./Hour.svelte"
	import Minute from "./Minute.svelte"
	import HourStat from "./HourStat.svelte";
	// import HistoryButton from "./HistoryButton.svelte"
	import EventList from "./EventList.svelte"
	import LogoutComponent from './Components/LogoutComponent.svelte';
    import { cats, getHistory, status } from './stores.ts'
	import Modal from "./Modal.svelte";

	import { onMount } from 'svelte';

	getHistory()

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

<Modal>
	<main>
	<LogoutComponent />
	<span>{$status}</span>
	<p>
		<Hour />時<Minute />分以降、何をしていましたか?
	</p>
	{#each Object.keys($cats) as id}
	<Category {id}/>
	{/each}
	<button name="name" on:click={addCategory} >+ New Category</button>
	
	<Tabs>
		<TabList>
			<Tab>History</Tab>
			<Tab>This 24 hours</Tab>
			<Tab>Statistics</Tab>
		</TabList>
	
		<TabPanel>
			<EventList />
		</TabPanel>
	
		<TabPanel>
			<!-- <HistoryButton /> -->
			<HourStat />
		</TabPanel>
	
		<TabPanel>
			<h2>Third panel</h2>
		</TabPanel>
	</Tabs>
</main>
</Modal>

<style>
	p {
		margin: 0;
	}
	span {
		color: #f00;
	}
</style>