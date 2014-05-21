window.rnd = function(p1, p2) {
        var r = Math.random();
        if (Array.isArray(p1)) {
            return p1[Math.floor(r * p1.length)];
        }

        if (!(p1 === undefined)) {
            if (!(p2 === undefined)) {
                r = r * (p2 - p1) + p1;
            } else {
                r = r * 2 * p1 - p1;
            }
        }
        return r;
};

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


window.map = function(value, min1, max1, min2, max2){
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1))
}