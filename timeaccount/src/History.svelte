<script lang="ts">
    import { getHistory } from './stores';
    import { history } from './stores.ts'
</script>

<ul>
    {#each $history as event, i}
    <!-- 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes-->
    <li>{event[5]}:{event[6]} -{event[2]}
        | category {event[3]}
        | {event[4]}</li>
    {/each}
</ul>
<button on:click={getHistory} >Load History (test)</button>

