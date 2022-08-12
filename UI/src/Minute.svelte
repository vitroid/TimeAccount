<script lang="ts">
    const items = [...Array(60).keys()];
    import { minute } from './stores';

    // let selected = $minute
    // $: {
    //     selected = $minute
    // }
</script>

<select bind:value={$minute}>
	{#each items as value}<option {value}>{value}</option>{/each}
</select>

<style>
    select {
        background: var(--bg-color);
		border: none;
        color: var(--text-color);
    }
</style>
