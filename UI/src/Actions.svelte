<script lang="ts">
    import { palettes } from './color';
    import { history } from './stores';
    import TagTitle from './TagTitle.svelte';

    let actions = []

    history.subscribe(h => {
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const oldest = now - 24*60

        let i=0
        while ( (h.length < i) && (h[i].endtime > oldest) ){
            i++
        }
        actions = h.slice(0, i-1)
    })

</script>


<div class="outerbox">
    <TagTitle title="Recent actions" />
    <div class="list">
        {#each actions as action}
        <!-- 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes-->
        <div class="ev" style="background-color:{$palettes[action.category]};" >
            <!-- height:{action[2]}px; -->
            {action.hours}:{action.minutes} {action.action}
        </div>
        {/each}
    </div>
</div>

<style>
    .outerbox {
        overflow: scroll;
    }
    .list {
        display:  flex;
        flex-flow: column nowrap;
        overflow: auto;
        /* width:    200px; */
    }
    .ev {
        border: #0000 solid 0.2px;
        color: white;
        margin-left: 1px;
        margin-right: 1px;
    }
</style>
