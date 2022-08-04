<script lang="ts">
  import { getContext } from 'svelte';
	import SeatDialog from './SeatDialog.svelte';
  import { yourtable, hall_info } from     "./stores";
	// import Dialog from './Dialog.svelte';
  export let table_id: number 
  export let nSeat: number;

  // Hall全体の情報が更新されたら受けとる。
  let namelist;
  let hi
  let nRemain
  let background = '#f002'

  hall_info.subscribe(value => {
    hi = value
    namelist = []
    nRemain = nSeat
    if (table_id in hi){
      const names = hi[table_id]
      Object.keys(names).forEach(seat=>{namelist.push({seat, name:names[seat]})})
      nRemain = nSeat - Object.keys(names).length
    }
    if ( nRemain == 0 ){
      background = '#f000'
    }
    else if ( $yourtable == table_id ) {
      background = '#f005'
    }
    else {
      background = '#f002'
    }
  });

  // required for modal dialog
  const { open } = getContext('simple-modal');

  const showSeatDialog = () => {
		open(
			SeatDialog,
			{
        table_id,
        nSeat,
			},
			{
				closeButton: true,
    		closeOnEsc: true,
    		closeOnOuterClick: true,
			}
	  );
  }
</script>

<button on:click={showSeatDialog} style:background-color={background}>
  <div class="container">
    <span class="balloon" >
      {#each namelist as member}
      <p>{table_id}-{member.seat}: {member.name} </p>
      {/each}
    </span>
    <div class="centered">
      {table_id}
    </div>
    <div class="remain">
      {nRemain} left
    </div>
    <!-- <Remain {table_id} {nSeat} /> -->
  </div>
</button>

<style>
  button {
    font-family: inherit;
    font-size: inherit;
    margin: 1px;
    /* padding: 1em 2em; */
    color: #ff3e00;
    /* border-radius: 2em; */
    border: 2px solid rgba(255, 62, 0, 0);
    outline: none;
    width: 70px;
    height: 70px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
		padding: 0;
		/* margin: 0 auto; */
		display: flex;
		justify-content: center;
		background: url("../assets/Table7.png") no-repeat scroll center transparent;
		background-color:  rgba(255, 62, 0, 0.1);
		background-size: 90%;
  }

  /* button:focus {
    border: 2px solid #ff3e00;
    outline: 1px;
  } */

	.container {
		position: relative;
		/* font-family: inherit;
		font-size: inherit; */
		margin: 0;
		color: #ff3e00;
		/* border: 2px solid rgba(255, 62, 0, 100); */
		outline: none;
    padding: 0;
    width: 100%;
    height: 100%;
		/* background: url("../assets/Table7.png") no-repeat scroll center transparent;
		background-color:  rgba(255, 62, 0, 0.1); */
		/* background-size: 95%; */
	}
  /* 吹出表示 */
  .container:hover .balloon {
    display: inline;
  }
  .balloon {
    /* position: absolute; */
    position: fixed;
    display: none; /*通常は表示しない*/
    padding: 2px;
    background-color: #fffc;
    font-size: 80%;
    color: #000;
    z-index: 500;
    overflow-y: scroll;
  }
	/* Centered text */
	.centered {
		position: absolute;
		top: 35%;
		left: 50%;
		transform: translate(-50%, 0%);
	}
  p {
    text-align: left;
  }
  .remain {
		position: absolute;
    font-size: 80%;
    text-align: left;
    color: #000;
		bottom: 0;
		left: 0;
    background-color: #fff8;
  }

  </style>
