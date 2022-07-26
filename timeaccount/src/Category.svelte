<script lang="ts">
    import { get } from 'svelte/store';
    import { hour, minute, history, storeAction, cats } from './stores.ts'
    // Categoryとは、テキスト入力枠とボタンのセットである。
    export let id;
    // export let whatUdid;
    let buttons
    let sorted

    cats.subscribe( value=> {
        buttons = value[id]
        sorted = Object.keys(buttons).sort((a,b)=>buttons[b] - buttons[a])
        // console.log(sorted)
    })

    let inputtext;

    function update(action){
        // 現在時刻
        const date = new Date()
        const now = date.getTime() / 1000 / 60 // in minute
        const h = date.getHours()
        const m = date.getMinutes()
        // 開始時刻との差
        const delta = (h-$hour+24)%24*60+(m-$minute)
        // 1分以上なら
        if ( delta > 0 ){
            // 履歴に記録する
            history.update(v => [[0,now,delta,id,action,h,m], ...v])
            // historyを更新することで、自動的にボタンが更新される、はず。
            storeAction(now, delta, id, action)
        }
        // // ボタンを作成
        // buttons[name] = now
        // // sort and pick 6 newest items
        // sorted = Object.keys(buttons).sort((a,b)=>buttons[b] - buttons[a]).slice(0,6)
        // // re-make buttons
        // let newbuttons = {}
        // sorted.forEach(element => {
        //     newbuttons[element] = buttons[element]
        // });
        // buttons = newbuttons
        hour.set(h)
        minute.set(m)
    }


    function onKeyDown (e) {
        if (e.key == "Enter"){
            update(inputtext)
        }
        // inputtext = ""
    }
    function onClick (e) {
        update(e.target.innerText)
    }


    // ヒストリーを読みこんで、ボタンを再配置する機能が欲しい。
</script>

<p>
    <input bind:value={inputtext} placeholder="What did you do til now?" on:keydown={onKeyDown} />
    {#each sorted as name, i}
    <button on:click={onClick} >{name}</button>
    {/each}
</p>

<style>
    p {
        margin: 0;
    }
</style>