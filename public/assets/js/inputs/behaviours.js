class behaviours {
    constructor(_b) {
        this._b = _b;
    }
    do (d) {
        d._b = d._b ? d._b : this._b.default;
        d.i = Math.floor(Math.random() * 3) ? "actions" : "destinations";
        return JSON.parse(`{"${d.i}":${JSON.stringify(d._b[d.i])}}`);
    }
}
export { behaviours };