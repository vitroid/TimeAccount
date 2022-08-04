<script lang="ts">
    import { history } from './stores';
    import { palette } from './color';
</script>


{#each $history as event, i}
<!-- 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes-->
<div class="ev" style="background-color:{palette(event[3])};" >
    <!-- height:{event[2]}px; -->
    {event[5]}:{event[6]} | {event[4]}
</div>
{/each}

<style>
    .ev {
        border: white solid 0.2px;
        color: white;
    }
</style>
