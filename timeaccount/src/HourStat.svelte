<script lang="ts">
    import { history } from './stores';
    import { palette } from './color';

    let tiles = {}
    let hours = []

    function accum(tiles, hour, category, minute){
        if ( ! (hour in tiles) ){
            tiles[hour] = {}
        }
        if ( ! (category in tiles[hour])){
            tiles[hour][category] = 0
        }
        tiles[hour][category] += minute
    }

    history.subscribe(value => {
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const h = date.getHours()
        const m = date.getMinutes()

        hours = []
        for (let i=0; i<24; i++){
            hours = [...hours, h-i]
        }

        // 時間ごとの統計
        let oneDayAgo = now - 60*24
        tiles = {}
        let i = 0
        if ( value.length > 0 ){
            let event = value[i]
            let endtime = event[1]
            while ( oneDayAgo < endtime ){
                let duration = event[2]
                let category = event[3]
                let deltahour = Math.floor(endtime / 60) - Math.floor(now / 60)
                let hour = h + deltahour
                let minute = event[6]
                while ( minute < duration ){
                    accum(tiles, hour, category, minute)
                    duration -= minute
                    hour --
                    minute = 60
                }
                accum(tiles, hour, category, duration)
                i++
                event = value[i]
                endtime = event[1]
            }
        }
    })

</script>

 <!-- 別の表現を考える。 -->
{#if Object.keys(tiles).length}
{#each hours as hour, i}
<div class="ti">
    <div class="he">{(hour+24)%24}</div>
    {#if hour in tiles}
    {#each Object.keys(tiles[hour]).sort() as cat}
    <div class="ca" style="width:{tiles[hour][cat]}%;background-color:{palette(cat)};">
        {cat}
    </div>
    {/each}
    {/if}
</div>
{/each}
{/if}

<style>
    .ti {
        display: flex;
        text-align: center;
        font-size:50%;
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
