<script>
	import { Tabs, TabList, TabPanel, Tab } from './Components/Tabs/tabs.js';
	import Category from "./Category.svelte"
	import Hour from "./Hour.svelte"
	import Minute from "./Minute.svelte"
	import HourStat from "./HourStat.svelte";
	import DayStat from "./DayStat.svelte";
	import EventList from "./EventList.svelte"
	import LogoutComponent from './Components/LogoutComponent.svelte';
    import { cats, getHistory, status } from './stores.ts'

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

<main>
	<LogoutComponent />
	<span>{$status}</span>
	<p>
		<Hour />時<Minute />分以降、何をしていましたか? TEST
	</p>
	{#each Object.keys($cats) as id}
	<Category {id}/>
	{/each}
	<button name="name" on:click={addCategory} >+ New Category</button>
	
	<Tabs>
		<TabList>
			<Tab>Events</Tab>
			<Tab>Hourly stat</Tab>
			<Tab>Daily stat</Tab>
		</TabList>
	
		<TabPanel>
			<EventList />
		</TabPanel>
	
		<TabPanel>
			<HourStat />
		</TabPanel>
	
		<TabPanel>
			<DayStat />
		</TabPanel>
	</Tabs>
</main>

<style>
	p {
		margin: 0;
	}
	span {
		color: #f00;
	}
</style>