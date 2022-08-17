<script lang="ts">
    import { palettes } from './color';
    import { statistics } from './stat';
    import { history } from './stores';
    import TagTitle from './TagTitle.svelte';

    let tiles = {}
    let hours = []


    history.subscribe(events => {
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const h   = date.getHours()
        tiles = statistics( events, 60, now - 60*24)

        for (let i=0; i<24; i++){
            hours = [...hours, (h-i+24)%24]
        }
    })

</script>

<div class="outerbox">
    <TagTitle title="Hourly statistics" />
    <div class="container">
        {#if Object.keys(tiles).length}
        {#each Array(24) as delta, i}
        <div class="ti">
            <div class="he">{hours[i]}</div>
            {#if tiles[i]}
            {#each Object.keys(tiles[i]).sort() as cat}
            <div class="ca" style="width:{tiles[i][cat]*80/60}%;background-color:{$palettes[cat]};">
                {cat}
            </div>
            {/each}
            {/if}
        </div>
        {/each}
        {/if}
    </div>
</div>

<style>
    .container {
        padding: 10px;
        /* padding-top: 50px; */
    }
    .ti {
        display: flex;
        text-align: center;
        /* font-size:50%; */
    }
    .ca {
        margin: 0px;
        color: white;
        text-align: center;
    }
    .he {
        width:20%;
        text-align: center;
    }
</style>
