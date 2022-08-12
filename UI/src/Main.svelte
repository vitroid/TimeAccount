<script>
	import AddCategory from "./AddCategory.svelte";
	import Category from "./Category.svelte";
	import LogoutComponent from './Components/LogoutComponent.svelte';
	import DayStat from "./DayStat.svelte";
	import EventList from "./EventList.svelte";
	import HourStat from "./HourStat.svelte";
	import ShowStatus from "./ShowStatus.svelte";
	import { cats,getHistory } from './stores';
	import TimeChooser from "./TimeChooser.svelte";
// for modal
	import Modal from "./Components/Modal.svelte";
	import SettingButton from './SettingButton.svelte';
// swipe
	// import { Swipe,SwipeItem } from "svelte-swipe";
	import Swipe from "./Components/Swipe/Swipe.svelte";
	import SwipeItem from "./Components/Swipe/SwipeItem.svelte";

	const swipeConfig = {
		autoplay: false,
		delay: 2000,
		showIndicators: true,
		transitionDuration: 1000,
		defaultIndex: 0,
	};
	// /swipe

	getHistory()

	setInterval(() => {
		getHistory()
	}, 60*1000)  // every one minute

</script>

<main>
	<div class="statusbar">
		<TimeChooser />
		<ShowStatus />
		<div class="tools">
			<Modal>
				<SettingButton />
			</Modal>
			<LogoutComponent />
		</div>
	</div>
	{#each Object.keys($cats) as id}
	<Category {id}/>
	{/each}
	<AddCategory />
	<div class="swipe-holder">
		<Swipe {...swipeConfig}>
			<SwipeItem>
				<EventList />
			</SwipeItem>

			<SwipeItem>
				<HourStat />
			</SwipeItem>

			<SwipeItem>
				<DayStat />
			</SwipeItem>
		</Swipe>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		/* height: 100%; */
		margin: auto;
		-webkit-filter:drop-shadow(1px 3px 5px var(--shadow-color));
		-moz-filter:drop-shadow(1px 3px 5px var(--shadow-color));
		-ms-filter:drop-shadow(1px 3px 5px var(--shadow-color));
		filter:drop-shadow(1px 3px 5px var(--shadow-color));
	}
	.statusbar {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
	}
	.tools {
		display: flex;
		flex-wrap: nowrap;
		justify-content: right;
	}
	.swipe-holder{
		height: 30vh;
		width: 100%;
	}
</style>
