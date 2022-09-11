<script lang="ts">
    import { palettes } from './color';
    import { cats,history,hour,minute,storeAction } from './stores';
    // Categoryとは、テキスト入力枠とボタンのセットである。
    export let id;

    let buttons = {}
    let sorted = []

    // test if obj is a hash or not
    function isObject ( obj ) {
        return obj && (typeof obj  === "object");
    }

    cats.subscribe( value=> {
        sorted = []
        if ( isObject(value) ){
            buttons = value[id]
            if ( isObject(buttons) ){
                sorted = Object.keys(buttons).sort((a,b)=>buttons[b] - buttons[a])
            }
        }
    })

    let input_text;

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
            history.update(v => [{
                user_id:0,
                endtime:now,
                dutation:delta,
                category:id,
                action:action,
                hours:h,
                minutes:m}, ...v])
            // historyを更新することで、自動的にボタンが更新される、はず。
            storeAction(now, delta, id, action)

        }
        // 最新版では、サーバと矛盾がない限りreloadしないので、ボタンを強制的に追加する。
        // ボタンを作成または更新
        if ( ! buttons ){
            buttons = {}
        }
        buttons[action] = now
        // sort and pick 6 newest items
        sorted = Object.keys(buttons).sort((a,b)=>buttons[b] - buttons[a]) //.slice(0,6)
        // re-make buttons
        let newbuttons = {}
        sorted.forEach(element => {
            newbuttons[element] = buttons[element]
        });
        buttons = newbuttons

        // 最終操作時刻を更新
        hour.set(h)
        minute.set(m)
    }

    let input_field

    function onKeyDown (e) {
        if (e.key == "Enter"){
            update(input_text)
            input_field.value = ""
        }
    }
    function onClick (e) {
        update(e.target.innerText)
    }


</script>

<div class="container" style:background-color={$palettes[id]} >
    <input bind:this={input_field} bind:value={input_text} placeholder="What did you do til now?" on:keydown={onKeyDown} />
    {#each sorted as name, i}
    <button on:click={onClick} >{name}</button>
    {/each}
</div>

<style>
    .container {
        display: inline-block;
        margin: 0;
        padding: 2px;
        margin-top: 1px;
        margin-bottom: 1px;
        border-radius: 19px;
    }
    button {
        margin: 0;
        background-color: #0000;
        color: white;
        border-radius: 15px;
        width: fit-content;
    }
    input {
        margin: 0;
        background-color: #0000;
        color: white;
        border-radius: 15px;
        transition: width 1s;
        width: 30px;
        height: 30px;
    }
    input:hover, input:focus{
        width:197px;
    }
</style>
