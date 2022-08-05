<script lang="ts">
    import { history } from './stores';
    import { palettes } from './color';
    import { statistics } from './stat'

    let tiles = {}
    history.subscribe(events => {
        const binw = 60*24
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const oldest = now - 24*60*7
        tiles = statistics( events, binw, oldest )
    })

    const daynames = ["Today", "Yesterday", "2 days ago", "3 days ago", "4 days ago", "5 days ago", "6 days ago", "A week ago"]

</script>

<div class="container">
{#if Object.keys(tiles).length}
{#each Object.keys(tiles).sort() as day, i}
<div class="ti">
    <div class="he">{daynames[day]}</div>
    {#each Object.keys(tiles[day]).sort() as cat}
    <div class="ca" style="width:{tiles[day][cat]}px;background-color:{$palettes[cat]};">
        {cat}
    </div>
    {/each}
</div>
{/each}
{/if}
</div>

<style>
    .container {
        display: flex;
        flex-flow: column nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        /* overflow: auto; */
    }
    .ti {
        display: flex;
        text-align: center;
        width: 100%;
        /* font-size:50%; */
    }
    .ca {
        margin: 0px;
        color: white;
        text-align: center;
    }
    .he {
        width:200px;
        text-align: center;
    }
</style>
