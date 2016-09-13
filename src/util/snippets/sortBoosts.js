// Find the boost we want to do.
var boostChems = _.reduce(BOOSTS[curBoost[0]], function (r, b, k) {
    if (b[curBoost[1]]) {
        if (k.indexOf('X') === 0) {
            r[2] = k;
        } else if (k.indexOf('H2O') !== -1 || k.indexOf('HO2') !== -1) {
            r[1] = k;
        } else { 
            r[0] = k;
        }
    }
    return r;
}, []);