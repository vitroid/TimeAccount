<script lang="ts">
    import { history } from './stores';
    import { palette } from './color';
    import { statistics } from './stat'

    let tiles = {}
    history.subscribe(events => {
        const binw = 60*24
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const oldest = now - 24*60*7
        tiles = statistics( events, binw, oldest )
    })

</script>

<div class="container">
{#if Object.keys(tiles).length}
{#each Object.keys(tiles).sort() as day, i}
<div class="ti">
    <div class="he">{day}</div>
    {#each Object.keys(tiles[day]).sort() as cat}
    <div class="ca" style="width:{tiles[day][cat]}%;background-color:{palette(cat)};">
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
        width:50px;
        text-align: center;
    }
</style>
