<script>
	import { Tabs, TabList, TabPanel, Tab } from './Components/Tabs/tabs.js';
	import Category from "./Category.svelte"
	import ColorSelector from "./ColorSelector.svelte"
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
	<div class="statusbar">
		<p>
			<Hour />時<Minute />分以降、何をしていましたか?
		</p>
		<div class="status">{$status}</div>
		<LogoutComponent />
	</div>
	{#each Object.keys($cats) as id}
	<Category {id}/>
	{/each}
	<button name="name" on:click={addCategory} >+ New Category</button>
	
	<Tabs>
		<TabList>
			<Tab>Events</Tab>
			<Tab>Hourly stat</Tab>
			<Tab>Daily stat</Tab>
			<Tab>Settings</Tab>
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

		<TabPanel>
			<ColorSelector />
		</TabPanel>
	</Tabs>
</main>

<style>
	main {
		max-width: 800px;
		height: 100%;
		margin: auto;
		-webkit-filter:drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.2));
		-moz-filter:drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.2));
		-ms-filter:drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.2));
		filter:drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.2));
		background-color: white;
	}
	p {
		margin: 0;
	}
	.statusbar {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
	}
	.status {
		color: #f00;
	}
</style>