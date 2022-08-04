<script lang="ts">
    import { getContext } from 'svelte';
	import HourStat from "./HourStat.svelte";

    // required for modal dialog
    const { open } = getContext('simple-modal');

    const showHistoryDialog = () => {
        open(
            HourStat,
            {
            },
            {
                closeButton: true,
                closeOnEsc: true,
                closeOnOuterClick: true,
            }
        );
    }

</script>

<button on:click={showHistoryDialog}>
History
</button>