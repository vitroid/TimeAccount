<script lang="ts">
    import { palettes } from './color';
    import { daynames,shortnames } from './stat';
    import { history } from './stores';
    import TagTitle from './TagTitle.svelte';

    // 日付けごとに別のカラムにする。
    let days = []
    let events = []
    const JSTFIX = 9*60

    history.subscribe(h => {
        days = []
        events = []
        let today = 0
        for(let i=0; i<h.length; i++){
            let event = h[i]
            let daycode = Math.floor((event.endtime+JSTFIX) / (24*60) )
            if ( today == 0 ){
                today = daycode
            }
            if ( daycode != today ){
                today = daycode
                days = [...days, events]
                if ( days.length >= 7 ){
                    return
                }
                events = []
            }
            events = [...events, event]
        }
        if ( events.length > 0 ){
            days = [...days, events]
        }
    })

    let width;

</script>

<svelte:window bind:innerWidth={width} />

<div class="outerbox">
    <TagTitle title="History" />
    <div class="container">
        {#each days as events, day}
        <div class="list">
            <div>
                {#if width > 500}
                    {daynames[day]}
                {:else}
                    {shortnames[day]}
                {/if}
            </div>
            {#each events as event, i}
            <!-- 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes-->
            <div class="ev" style="background-color:{$palettes[event.category]};" >
                <!-- height:{event[2]}px; -->
                {event.hours}:{event.minutes} {event.action}
            </div>
            {/each}
        </div>
        {/each}
    </div>
</div>

<style>
    .outerbox {
        overflow: scroll;
    }
    .container {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 10px;
        /* padding-top: 50px; */
    }
    .list {
        display:  flex;
        flex-flow: column nowrap;
        overflow: auto;
        width:    200px;
    }
    .ev {
        border: #0000 solid 0.2px;
        color: white;
        margin-left: 1px;
        margin-right: 1px;
    }
</style>
