import { accum } from './accum'

export function statistics(events, binw, oldest){
    let tiles = {}

    const JSTFIX = 9*60

    const date = new Date()
    const now = date.getTime() / 1000 / 60// in minute
    const origin = now + JSTFIX

    tiles = {}
    // ひとつあとのイベントがはじまった時刻
    let laststart = 0
    // 時間をさかのぼる順序で
    for ( let i=0; i<events.length; i++ ){
        let event = events[i]
        let endtime = event[1]
        if ( oldest > endtime ){
            break;
        }
        if ( laststart == 0 ){
            laststart = endtime
        }
        let duration = event[2]
        // 重なっている時は、新しい記録を信じ、古いほうを削る。
        if ( laststart < endtime ){
            duration -= (endtime - laststart)
            endtime = laststart
            if ( duration < 0 ){
                continue
            }
        }
        laststart = endtime - duration
        const category = event[3]
        const bin = Math.floor( (endtime + JSTFIX ) / binw )
        let dbin = Math.floor( origin / binw ) - bin
        let left = endtime + JSTFIX - bin*binw
        while ( left < duration ){
            accum(tiles, dbin, category, left)
            duration -= left
            dbin ++
            left = binw
        }
        if ( duration > 0 ){
            accum(tiles, dbin, category, duration)
        }
    }
    for (let bin in tiles){
        let sum = 0
        for ( let cat in tiles[bin]){
            sum += tiles[bin][cat]
        }
        const unaccounted = binw - sum
        if ( unaccounted > 0){
            tiles[bin][-1] = unaccounted
        }
    }
    return tiles
}