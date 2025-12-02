// moved the level table 


COMMON.levelTable = [];
{
    let current = 0;
    for (let i = 0; i < 100; i++) {
        COMMON.levelTable.push(i * (2 + i * 0.25) | 0);
    }
}
COMMON.levelToExp = function(level) {
    return COMMON.levelTable[level]
}
;