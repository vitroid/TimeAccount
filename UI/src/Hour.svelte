<script lang="ts">
    const items = [...Array(24).keys()];
    import { hour } from './stores'

    // let h
    // hour.subscribe(value => {
    //     h = value
    // }

</script>

<select bind:value={$hour}>
	{#each items as value}<option {value}>{value}</option>{/each}
</select>
