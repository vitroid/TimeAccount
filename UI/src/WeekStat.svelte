<script lang="ts">
    import { accum } from './accum';
    import { palettes } from './color';
    import { history } from './stores';
    import TagTitle from './TagTitle.svelte';

    let categories
    let catsum;

    // 使途不明時間の統計がない。
    history.subscribe(h => {
        categories = []
        for(let i=0; i<h.length; i++){
            const event = h[i]
            const endtime = event.endtime
            const duration = event.duration
            const category = event.category
            const action = event.action

            accum(categories, category, action, duration)
        }
        let grandsum = 0
        catsum = {}
        Object.keys(categories).forEach(category=>{
            let sum = 0
            Object.keys(categories[category]).forEach(action=>{
                sum += categories[category][action]
            })
            catsum[category] = sum
            grandsum += sum
            Object.keys(categories[category]).forEach(action=>{
                categories[category][action] *= 100 / sum
            })
        })
        Object.keys(catsum).forEach(category=>{
            catsum[category] *= 45 / grandsum
            // catsum[category] += 1
        })
    })

</script>



<div class="outerbox">
    <TagTitle title="TimeAccount of the week" />
    {#each Object.keys(categories) as category, i}
    <div class="container" style='height:{catsum[category]}vh; background-color:{$palettes[i]}' >
        {#each Object.keys(categories[category]).sort((a,b)=>{return categories[category][b] - categories[category][a]}) as action, j}
        <div class="item" style='width:{categories[category][action]}vw; height:{catsum[category]}vh;' >{action}</div>
        {/each}
    </div>
    {/each}
</div>

<style>


    .outerbox {
        padding: 10px;

        /* for children */
        display:  flex;
        flex-flow: column nowrap;
        justify-content: space-around;
    }
    .container {
        /* justify-content: flex-start; */
        align-items: flex-start;
        width: 100%;
        margin: 0;
        /* border: 1px solid black; */

        /* for children */
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        flex: 1 0 auto;
    }
    .item {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        /* align-items: stretch; */
        overflow: hidden;
        /* justify-content: center; */
        border: 1px solid var(--bg-color);
        /* margin: 1px; */
    }
</style>
