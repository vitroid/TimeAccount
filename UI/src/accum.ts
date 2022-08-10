export function accum(tiles, index, category, minute){
    if ( ! (index in tiles) ){
        tiles[index] = {}
    }
    if ( ! (category in tiles[index])){
        tiles[index][category] = 0
    }
    tiles[index][category] += minute
}
