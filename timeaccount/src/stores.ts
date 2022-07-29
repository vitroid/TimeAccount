import { writable, get } from 'svelte/store';

const date = new Date()
export const hour = writable(date.getHours());
export const minute = writable(date.getMinutes());
export const history = writable([])
export const cats = writable({})
// for debug
export const token = writable("")

export const offline = writable(true)

const BASEURL = 'http://localhost:8000'
// const BASEURL = "https://timeaccount-test-app.herokuapp.com"

export async function getToken (username, password) {
    /* parameters:
       username and password

       then find the user id
       and make a new token

       returns:
       token
       */
     

    const body_ = JSON.stringify({
        "un": username,
        "pw": password
    })

    const res = await fetch(BASEURL+'/v0/auth/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: body_
    })
    
    // もし不成功なら空文字列を返す。
    if ( res.status != 200 ){
        return ""
    }

    let result = await res.json()
    // console.log("RESULT:"+result)
    if ( result != "" ){
        token.set(result)
        return result
    }
    return "";
}



export async function storeAction (endtime, duration, category, action) {
    /*
        parameters:
        endtime: unixtime?
        duration: in minutes
        category: integer
        action: string

        store an action record to the server
    */

    const body_ = JSON.stringify({
        token: get(token),
        endtime: endtime,
        duration: duration,
        category: category,
        action: action
    })

    const controller = new AbortController()

    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(BASEURL+'/v0/', {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
          },
        body: body_,
        signal: controller.signal // 5 sec
    }).catch(()=>{offline.set(true)})
      
    if ( (typeof res === 'undefined') || (res.status != 200) ){
        offline.set(true)
        return
    }
    offline.set( false )
}


export async function getHistory () {
    /*
        get the history of actions in descend time order

        store the history and category data (button list)

        This is called every one minute in Main.svelte
     */

    const body_ = JSON.stringify({
        "token": get(token)
    })

    const controller = new AbortController()

    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const duration = "0"
    const res = await fetch(BASEURL+'/v0/query/'+duration, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: body_,
        signal: controller.signal // 5 sec
    }).catch(()=>{offline.set(true)})
      
    if ( (typeof res === 'undefined') || (res.status != 200) ){
        offline.set(true)
        return
    }
    offline.set( false )

    res.json().then(result=>{
        let h = JSON.parse(result)

        // もし、読みこんだhistoryの最終データが、クライアント上の最終データと同じ時刻であれば、
        // historyもcatsも更新しない。
        // 更新してしまうと、クライアント側で再表示が必要になる。

        const l = get(history)
        if ( l.length > 0 ){
            // 手許の最終actionの時刻
            const locallast = Math.floor(l[0][1])
            // サーバ上の最終actionの時刻
            const remotelast = h[0][1]
            if ( locallast == remotelast ){
                return
            } 
        }

        let categories = {}
        for (let r in h){
            let row = h[r]
            // 0 user_id, 1 endtime, 2 duration, 3 category, 4 action, 5 hours, 6 minutes

            // svelteでの表示が楽になるように、時と分を準備する。
            const minutes = Math.floor(row[1] % 60)
            const hours   = Math.floor(row[1] / 60 + 9) % 24
            row.push(hours)
            row.push(minutes)

            // categoryを再構成
            const cat = row[3]
            const endtime = row[1]
            const action = row[4]

            if ( ! (cat in categories) ){
                categories[cat] = {}
            }
            if ( ! (action in categories[cat]) ){
                // 一番新しいものだけを追加する。
                categories[cat][action] = endtime
            }
        }
        // writableを更新する。
        history.set(h)
        cats.set(categories)
    })
    return
}
