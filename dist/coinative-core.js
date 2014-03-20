var BigInteger;

(function() {
    var dbits;
    var canary = 0xdeadbeefcafe;
    var j_lm = (canary & 16777215) == 15715070;
    BigInteger = function BigInteger(a, b, c) {
        if (a != null) if ("number" == typeof a) this.fromNumber(a, b, c); else if (b == null && "string" != typeof a) this.fromString(a, 256); else this.fromString(a, b);
    };
    function nbi() {
        return new BigInteger(null);
    }
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 67108864);
            w[j++] = v & 67108863;
        }
        return c;
    }
    function am2(i, x, w, j, c, n) {
        var xl = x & 32767, xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 32767;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 1073741823;
        }
        return c;
    }
    function am3(i, x, w, j, c, n) {
        var xl = x & 16383, xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 16383;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 16383) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 268435455;
        }
        return c;
    }
    var inBrowser = typeof navigator !== "undefined";
    if (inBrowser && j_lm && navigator.appName == "Microsoft Internet Explorer") {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else if (inBrowser && j_lm && navigator.appName != "Netscape") {
        BigInteger.prototype.am = am1;
        dbits = 26;
    } else {
        BigInteger.prototype.am = am3;
        dbits = 28;
    }
    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = (1 << dbits) - 1;
    BigInteger.prototype.DV = 1 << dbits;
    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    function int2char(n) {
        return BI_RM.charAt(n);
    }
    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return c == null ? -1 : c;
    }
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }
    function bnpFromInt(x) {
        this.t = 1;
        this.s = x < 0 ? -1 : 0;
        if (x > 0) this[0] = x; else if (x < -1) this[0] = x + DV; else this.t = 0;
    }
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }
    function bnpFromString(s, b) {
        var k;
        if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 256) k = 8; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else {
            this.fromRadix(s, b);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = s.length, mi = false, sh = 0;
        while (--i >= 0) {
            var x = k == 8 ? s[i] & 255 : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0) this[this.t++] = x; else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
                this[this.t++] = x >> this.DB - sh;
            } else this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 128) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
        }
        this.clamp();
        if (mi) BigInteger.ZERO.subTo(this, this);
    }
    function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c) --this.t;
    }
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate().toString(b);
        var k;
        if (b == 16) k = 4; else if (b == 8) k = 3; else if (b == 2) k = 1; else if (b == 32) k = 5; else if (b == 4) k = 2; else return this.toRadix(b);
        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
        var p = this.DB - i * this.DB % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & (1 << p) - 1) << k - p;
                    d |= this[--i] >> (p += this.DB - k);
                } else {
                    d = this[i] >> (p -= k) & km;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if (d > 0) m = true;
                if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    }
    function bnNegate() {
        var r = nbi();
        BigInteger.ZERO.subTo(this, r);
        return r;
    }
    function bnAbs() {
        return this.s < 0 ? this.negate() : this;
    }
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0) return this.s < 0 ? -r : r;
        while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }
    function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16) != 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;
            r += 1;
        }
        return r;
    }
    function bnBitLength() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
    }
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    }
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = this[i] >> cbs | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    }
    function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c; else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }
    function bnpMultiplyTo(a, r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
    }
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    }
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]);
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);
            pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
        var i = r.t, j = i - ys, t = q == null ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y);
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r);
        if (ts < 0) BigInteger.ZERO.subTo(r, r);
    }
    function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
        return r;
    }
    function Classic(m) {
        this.m = m;
    }
    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m); else return x;
    }
    function cRevert(x) {
        return x;
    }
    function cReduce(x) {
        x.divRemTo(this.m, null, x);
    }
    function cMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
    function cSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }
    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;
    function bnpInvDigit() {
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3;
        y = y * (2 - (x & 15) * y) & 15;
        y = y * (2 - (x & 255) * y) & 255;
        y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
        y = y * (2 - x * y % this.DV) % this.DV;
        return y > 0 ? this.DV - y : -y;
    }
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << m.DB - 15) - 1;
        this.mt2 = 2 * m.t;
    }
    function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
        return r;
    }
    function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }
    function montReduce(x) {
        while (x.t <= this.mt2) x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            var j = x[i] & 32767;
            var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            while (x[j] >= x.DV) {
                x[j] -= x.DV;
                x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }
    function montSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }
    function montMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;
    function bnpIsEven() {
        return (this.t > 0 ? this[0] & 1 : this.s) == 0;
    }
    function bnpExp(e, z) {
        if (e > 4294967295 || e < 1) return BigInteger.ONE;
        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & 1 << i) > 0) z.mulTo(r2, g, r); else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    }
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
        return this.exp(e, z);
    }
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);
    function bnClone() {
        var r = nbi();
        this.copyTo(r);
        return r;
    }
    function bnIntValue() {
        if (this.s < 0) {
            if (this.t == 1) return this[0] - this.DV; else if (this.t == 0) return -1;
        } else if (this.t == 1) return this[0]; else if (this.t == 0) return 0;
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
    }
    function bnByteValue() {
        return this.t == 0 ? this.s : this[0] << 24 >> 24;
    }
    function bnShortValue() {
        return this.t == 0 ? this.s : this[0] << 16 >> 16;
    }
    function bnpChunkSize(r) {
        return Math.floor(Math.LN2 * this.DB / Math.log(r));
    }
    function bnSigNum() {
        if (this.s < 0) return -1; else if (this.t <= 0 || this.t == 1 && this[0] <= 0) return 0; else return 1;
    }
    function bnpToRadix(b) {
        if (b == null) b = 10;
        if (this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a), y = nbi(), z = nbi(), r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
            r = (a + z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d, y, z);
        }
        return z.intValue().toString(b) + r;
    }
    function bnpFromRadix(s, b) {
        this.fromInt(0);
        if (b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
        for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b * w + x;
            if (++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w, 0);
                j = 0;
                w = 0;
            }
        }
        if (j > 0) {
            this.dMultiply(Math.pow(b, j));
            this.dAddOffset(w, 0);
        }
        if (mi) BigInteger.ZERO.subTo(this, this);
    }
    function bnpFromNumber(a, b, c) {
        if ("number" == typeof b) {
            if (a < 2) this.fromInt(1); else {
                this.fromNumber(a, c);
                if (!this.testBit(a - 1)) this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                if (this.isEven()) this.dAddOffset(1, 0);
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                }
            }
        } else {
            var x = new Array(), t = a & 7;
            x.length = (a >> 3) + 1;
            b.nextBytes(x);
            if (t > 0) x[0] &= (1 << t) - 1; else x[0] = 0;
            this.fromString(x, 256);
        }
    }
    function bnToByteArray() {
        var i = this.t, r = new Array();
        r[0] = this.s;
        var p = this.DB - i * this.DB % 8, d, k = 0;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) r[k++] = d | this.s << this.DB - p;
            while (i >= 0) {
                if (p < 8) {
                    d = (this[i] & (1 << p) - 1) << 8 - p;
                    d |= this[--i] >> (p += this.DB - 8);
                } else {
                    d = this[i] >> (p -= 8) & 255;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if ((d & 128) != 0) d |= -256;
                if (k == 0 && (this.s & 128) != (d & 128)) ++k;
                if (k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }
    function bnEquals(a) {
        return this.compareTo(a) == 0;
    }
    function bnMin(a) {
        return this.compareTo(a) < 0 ? this : a;
    }
    function bnMax(a) {
        return this.compareTo(a) > 0 ? this : a;
    }
    function bnpBitwiseTo(a, op, r) {
        var i, f, m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
            f = a.s & this.DM;
            for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
            r.t = this.t;
        } else {
            f = this.s & this.DM;
            for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
            r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
    }
    function op_and(x, y) {
        return x & y;
    }
    function bnAnd(a) {
        var r = nbi();
        this.bitwiseTo(a, op_and, r);
        return r;
    }
    function op_or(x, y) {
        return x | y;
    }
    function bnOr(a) {
        var r = nbi();
        this.bitwiseTo(a, op_or, r);
        return r;
    }
    function op_xor(x, y) {
        return x ^ y;
    }
    function bnXor(a) {
        var r = nbi();
        this.bitwiseTo(a, op_xor, r);
        return r;
    }
    function op_andnot(x, y) {
        return x & ~y;
    }
    function bnAndNot(a) {
        var r = nbi();
        this.bitwiseTo(a, op_andnot, r);
        return r;
    }
    function bnNot() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }
    function bnShiftLeft(n) {
        var r = nbi();
        if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
        return r;
    }
    function bnShiftRight(n) {
        var r = nbi();
        if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
        return r;
    }
    function lbit(x) {
        if (x == 0) return -1;
        var r = 0;
        if ((x & 65535) == 0) {
            x >>= 16;
            r += 16;
        }
        if ((x & 255) == 0) {
            x >>= 8;
            r += 8;
        }
        if ((x & 15) == 0) {
            x >>= 4;
            r += 4;
        }
        if ((x & 3) == 0) {
            x >>= 2;
            r += 2;
        }
        if ((x & 1) == 0) ++r;
        return r;
    }
    function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i) if (this[i] != 0) return i * this.DB + lbit(this[i]);
        if (this.s < 0) return this.t * this.DB;
        return -1;
    }
    function cbit(x) {
        var r = 0;
        while (x != 0) {
            x &= x - 1;
            ++r;
        }
        return r;
    }
    function bnBitCount() {
        var r = 0, x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
        return r;
    }
    function bnTestBit(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t) return this.s != 0;
        return (this[j] & 1 << n % this.DB) != 0;
    }
    function bnpChangeBit(n, op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
    }
    function bnSetBit(n) {
        return this.changeBit(n, op_or);
    }
    function bnClearBit(n) {
        return this.changeBit(n, op_andnot);
    }
    function bnFlipBit(n) {
        return this.changeBit(n, op_xor);
    }
    function bnpAddTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] + a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c += a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c += a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c > 0) r[i++] = c; else if (c < -1) r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
    }
    function bnAdd(a) {
        var r = nbi();
        this.addTo(a, r);
        return r;
    }
    function bnSubtract(a) {
        var r = nbi();
        this.subTo(a, r);
        return r;
    }
    function bnMultiply(a) {
        var r = nbi();
        this.multiplyTo(a, r);
        return r;
    }
    function bnSquare() {
        var r = nbi();
        this.squareTo(r);
        return r;
    }
    function bnDivide(a) {
        var r = nbi();
        this.divRemTo(a, r, null);
        return r;
    }
    function bnRemainder(a) {
        var r = nbi();
        this.divRemTo(a, null, r);
        return r;
    }
    function bnDivideAndRemainder(a) {
        var q = nbi(), r = nbi();
        this.divRemTo(a, q, r);
        return new Array(q, r);
    }
    function bnpDMultiply(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    }
    function bnpDAddOffset(n, w) {
        if (n == 0) return;
        while (this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
            this[w] -= this.DV;
            if (++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    }
    function NullExp() {}
    function nNop(x) {
        return x;
    }
    function nMulTo(x, y, r) {
        x.multiplyTo(y, r);
    }
    function nSqrTo(x, r) {
        x.squareTo(r);
    }
    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;
    function bnPow(e) {
        return this.exp(e, new NullExp());
    }
    function bnpMultiplyLowerTo(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0;
        r.t = i;
        while (i > 0) r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
    }
    function bnpMultiplyUpperTo(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0;
        while (--i >= 0) r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i) r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
    }
    function Barrett(m) {
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }
    function barrettConvert(x) {
        if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m); else if (x.compareTo(this.m) < 0) return x; else {
            var r = nbi();
            x.copyTo(r);
            this.reduce(r);
            return r;
        }
    }
    function barrettRevert(x) {
        return x;
    }
    function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;
            x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }
    function barrettSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }
    function barrettMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }
    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;
    function bnModPow(e, m) {
        var i = e.bitLength(), k, r = nbv(1), z;
        if (i <= 0) return r; else if (i < 18) k = 1; else if (i < 48) k = 3; else if (i < 144) k = 4; else if (i < 768) k = 5; else k = 6;
        if (i < 8) z = new Classic(m); else if (m.isEven()) z = new Barrett(m); else z = new Montgomery(m);
        var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1], g2);
            while (n <= km) {
                g[n] = nbi();
                z.mulTo(g2, g[n - 2], g[n]);
                n += 2;
            }
        }
        var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
            if (i >= k1) w = e[j] >> i - k1 & km; else {
                w = (e[j] & (1 << i + 1) - 1) << k1 - i;
                if (j > 0) w |= e[j - 1] >> this.DB + i - k1;
            }
            n = k;
            while ((w & 1) == 0) {
                w >>= 1;
                --n;
            }
            if ((i -= n) < 0) {
                i += this.DB;
                --j;
            }
            if (is1) {
                g[w].copyTo(r);
                is1 = false;
            } else {
                while (n > 1) {
                    z.sqrTo(r, r2);
                    z.sqrTo(r2, r);
                    n -= 2;
                }
                if (n > 0) z.sqrTo(r, r2); else {
                    t = r;
                    r = r2;
                    r2 = t;
                }
                z.mulTo(r2, g[w], r);
            }
            while (j >= 0 && (e[j] & 1 << i) == 0) {
                z.sqrTo(r, r2);
                t = r;
                r = r2;
                r2 = t;
                if (--i < 0) {
                    i = this.DB - 1;
                    --j;
                }
            }
        }
        return z.revert(r);
    }
    function bnGCD(a) {
        var x = this.s < 0 ? this.negate() : this.clone();
        var y = a.s < 0 ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
            var t = x;
            x = y;
            y = t;
        }
        var i = x.getLowestSetBit(), g = y.getLowestSetBit();
        if (g < 0) return x;
        if (i < g) g = i;
        if (g > 0) {
            x.rShiftTo(g, x);
            y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
            if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
            if (x.compareTo(y) >= 0) {
                x.subTo(y, x);
                x.rShiftTo(1, x);
            } else {
                y.subTo(x, y);
                y.rShiftTo(1, y);
            }
        }
        if (g > 0) y.lShiftTo(g, y);
        return y;
    }
    function bnpModInt(n) {
        if (n <= 0) return 0;
        var d = this.DV % n, r = this.s < 0 ? n - 1 : 0;
        if (this.t > 0) if (d == 0) r = this[0] % n; else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
        return r;
    }
    function bnModInverse(m) {
        var ac = m.isEven();
        if (this.isEven() && ac || m.signum() == 0) return BigInteger.ZERO;
        var u = m.clone(), v = this.clone();
        var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
        while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u);
                if (ac) {
                    if (!a.isEven() || !b.isEven()) {
                        a.addTo(this, a);
                        b.subTo(m, b);
                    }
                    a.rShiftTo(1, a);
                } else if (!b.isEven()) b.subTo(m, b);
                b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v);
                if (ac) {
                    if (!c.isEven() || !d.isEven()) {
                        c.addTo(this, c);
                        d.subTo(m, d);
                    }
                    c.rShiftTo(1, c);
                } else if (!d.isEven()) d.subTo(m, d);
                d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) {
                u.subTo(v, u);
                if (ac) a.subTo(c, a);
                b.subTo(d, b);
            } else {
                v.subTo(u, v);
                if (ac) c.subTo(a, c);
                d.subTo(b, d);
            }
        }
        if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        if (d.compareTo(m) >= 0) return d.subtract(m);
        if (d.signum() < 0) d.addTo(m, d); else return d;
        if (d.signum() < 0) return d.add(m); else return d;
    }
    var lowprimes = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997 ];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
    function bnIsProbablePrime(t) {
        var i, x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i) if (x[0] == lowprimes[i]) return true;
            return false;
        }
        if (x.isEven()) return false;
        i = 1;
        while (i < lowprimes.length) {
            var m = lowprimes[i], j = i + 1;
            while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while (i < j) if (m % lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }
    function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0) return false;
        var r = n1.shiftRight(k);
        t = t + 1 >> 1;
        if (t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
            var y = a.modPow(r, this);
            if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while (j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2, this);
                    if (y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if (y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
    BigInteger.prototype.square = bnSquare;
}).call(this);

"use strict";

var sjcl = {
    cipher: {},
    hash: {},
    keyexchange: {},
    mode: {},
    misc: {},
    codec: {},
    exception: {
        corrupt: function(message) {
            this.toString = function() {
                return "CORRUPT: " + this.message;
            };
            this.message = message;
        },
        invalid: function(message) {
            this.toString = function() {
                return "INVALID: " + this.message;
            };
            this.message = message;
        },
        bug: function(message) {
            this.toString = function() {
                return "BUG: " + this.message;
            };
            this.message = message;
        },
        notReady: function(message) {
            this.toString = function() {
                return "NOT READY: " + this.message;
            };
            this.message = message;
        }
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = sjcl;
}

sjcl.cipher.aes = function(key) {
    if (!this._tables[0][0][0]) {
        this._precompute();
    }
    var i, j, tmp, encKey, decKey, sbox = this._tables[0][4], decTable = this._tables[1], keyLen = key.length, rcon = 1;
    if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
        throw new sjcl.exception.invalid("invalid aes key size");
    }
    this._key = [ encKey = key.slice(0), decKey = [] ];
    for (i = keyLen; i < 4 * keyLen + 28; i++) {
        tmp = encKey[i - 1];
        if (i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
            tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];
            if (i % keyLen === 0) {
                tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
                rcon = rcon << 1 ^ (rcon >> 7) * 283;
            }
        }
        encKey[i] = encKey[i - keyLen] ^ tmp;
    }
    for (j = 0; i; j++, i--) {
        tmp = encKey[j & 3 ? i : i - 4];
        if (i <= 4 || j < 4) {
            decKey[j] = tmp;
        } else {
            decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]];
        }
    }
};

sjcl.cipher.aes.prototype = {
    encrypt: function(data) {
        return this._crypt(data, 0);
    },
    decrypt: function(data) {
        return this._crypt(data, 1);
    },
    _tables: [ [ [], [], [], [], [] ], [ [], [], [], [], [] ] ],
    _precompute: function() {
        var encTable = this._tables[0], decTable = this._tables[1], sbox = encTable[4], sboxInv = decTable[4], i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;
        for (i = 0; i < 256; i++) {
            th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
        }
        for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
            s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
            s = s >> 8 ^ s & 255 ^ 99;
            sbox[x] = s;
            sboxInv[s] = x;
            x8 = d[x4 = d[x2 = d[x]]];
            tDec = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
            tEnc = d[s] * 257 ^ s * 16843008;
            for (i = 0; i < 4; i++) {
                encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
                decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
            }
        }
        for (i = 0; i < 5; i++) {
            encTable[i] = encTable[i].slice(0);
            decTable[i] = decTable[i].slice(0);
        }
    },
    _crypt: function(input, dir) {
        if (input.length !== 4) {
            throw new sjcl.exception.invalid("invalid aes block size");
        }
        var key = this._key[dir], a = input[0] ^ key[0], b = input[dir ? 3 : 1] ^ key[1], c = input[2] ^ key[2], d = input[dir ? 1 : 3] ^ key[3], a2, b2, c2, nInnerRounds = key.length / 4 - 2, i, kIndex = 4, out = [ 0, 0, 0, 0 ], table = this._tables[dir], t0 = table[0], t1 = table[1], t2 = table[2], t3 = table[3], sbox = table[4];
        for (i = 0; i < nInnerRounds; i++) {
            a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
            b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
            c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
            d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
            kIndex += 4;
            a = a2;
            b = b2;
            c = c2;
        }
        for (i = 0; i < 4; i++) {
            out[dir ? 3 & -i : i] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
            a2 = a;
            a = b;
            b = c;
            c = d;
            d = a2;
        }
        return out;
    }
};

sjcl.bitArray = {
    bitSlice: function(a, bstart, bend) {
        a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
        return bend === undefined ? a : sjcl.bitArray.clamp(a, bend - bstart);
    },
    extract: function(a, bstart, blength) {
        var x, sh = Math.floor(-bstart - blength & 31);
        if ((bstart + blength - 1 ^ bstart) & -32) {
            x = a[bstart / 32 | 0] << 32 - sh ^ a[bstart / 32 + 1 | 0] >>> sh;
        } else {
            x = a[bstart / 32 | 0] >>> sh;
        }
        return x & (1 << blength) - 1;
    },
    concat: function(a1, a2) {
        if (a1.length === 0 || a2.length === 0) {
            return a1.concat(a2);
        }
        var out, i, last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
        if (shift === 32) {
            return a1.concat(a2);
        } else {
            return sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
        }
    },
    bitLength: function(a) {
        var l = a.length, x;
        if (l === 0) {
            return 0;
        }
        x = a[l - 1];
        return (l - 1) * 32 + sjcl.bitArray.getPartial(x);
    },
    clamp: function(a, len) {
        if (a.length * 32 < len) {
            return a;
        }
        a = a.slice(0, Math.ceil(len / 32));
        var l = a.length;
        len = len & 31;
        if (l > 0 && len) {
            a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1);
        }
        return a;
    },
    partial: function(len, x, _end) {
        if (len === 32) {
            return x;
        }
        return (_end ? x | 0 : x << 32 - len) + len * 1099511627776;
    },
    getPartial: function(x) {
        return Math.round(x / 1099511627776) || 32;
    },
    equal: function(a, b) {
        if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
            return false;
        }
        var x = 0, i;
        for (i = 0; i < a.length; i++) {
            x |= a[i] ^ b[i];
        }
        return x === 0;
    },
    _shiftRight: function(a, shift, carry, out) {
        var i, last2 = 0, shift2;
        if (out === undefined) {
            out = [];
        }
        for (;shift >= 32; shift -= 32) {
            out.push(carry);
            carry = 0;
        }
        if (shift === 0) {
            return out.concat(a);
        }
        for (i = 0; i < a.length; i++) {
            out.push(carry | a[i] >>> shift);
            carry = a[i] << 32 - shift;
        }
        last2 = a.length ? a[a.length - 1] : 0;
        shift2 = sjcl.bitArray.getPartial(last2);
        out.push(sjcl.bitArray.partial(shift + shift2 & 31, shift + shift2 > 32 ? carry : out.pop(), 1));
        return out;
    },
    _xor4: function(x, y) {
        return [ x[0] ^ y[0], x[1] ^ y[1], x[2] ^ y[2], x[3] ^ y[3] ];
    }
};

sjcl.codec.utf8String = {
    fromBits: function(arr) {
        var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out += String.fromCharCode(tmp >>> 24);
            tmp <<= 8;
        }
        return decodeURIComponent(escape(out));
    },
    toBits: function(str) {
        str = unescape(encodeURIComponent(str));
        var out = [], i, tmp = 0;
        for (i = 0; i < str.length; i++) {
            tmp = tmp << 8 | str.charCodeAt(i);
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
};

sjcl.codec.hex = {
    fromBits: function(arr) {
        var out = "", i, x;
        for (i = 0; i < arr.length; i++) {
            out += ((arr[i] | 0) + 0xf00000000000).toString(16).substr(4);
        }
        return out.substr(0, sjcl.bitArray.bitLength(arr) / 4);
    },
    toBits: function(str) {
        var i, out = [], len;
        str = str.replace(/\s|0x/g, "");
        len = str.length;
        str = str + "00000000";
        for (i = 0; i < str.length; i += 8) {
            out.push(parseInt(str.substr(i, 8), 16) ^ 0);
        }
        return sjcl.bitArray.clamp(out, len * 4);
    }
};

sjcl.codec.base64 = {
    _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits: function(arr, _noEquals, _url) {
        var out = "", i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
        if (_url) {
            c = c.substr(0, 62) + "-_";
        }
        for (i = 0; out.length * 6 < bl; ) {
            out += c.charAt((ta ^ arr[i] >>> bits) >>> 26);
            if (bits < 6) {
                ta = arr[i] << 6 - bits;
                bits += 26;
                i++;
            } else {
                ta <<= 6;
                bits -= 6;
            }
        }
        while (out.length & 3 && !_noEquals) {
            out += "=";
        }
        return out;
    },
    toBits: function(str, _url) {
        str = str.replace(/\s|=/g, "");
        var out = [], i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, x;
        if (_url) {
            c = c.substr(0, 62) + "-_";
        }
        for (i = 0; i < str.length; i++) {
            x = c.indexOf(str.charAt(i));
            if (x < 0) {
                throw new sjcl.exception.invalid("this isn't base64!");
            }
            if (bits > 26) {
                bits -= 26;
                out.push(ta ^ x >>> bits);
                ta = x << 32 - bits;
            } else {
                bits += 6;
                ta ^= x << 32 - bits;
            }
        }
        if (bits & 56) {
            out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
        }
        return out;
    }
};

sjcl.codec.base64url = {
    fromBits: function(arr) {
        return sjcl.codec.base64.fromBits(arr, 1, 1);
    },
    toBits: function(str) {
        return sjcl.codec.base64.toBits(str, 1);
    }
};

sjcl.codec.base58 = {
    _chars: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    fromBits: function(arr) {
        if (sjcl.bitArray.bitLength(arr) > 0) {
            var x = sjcl.bn.fromBits(arr), modulus = sjcl.bn.fromBits(arr), out = "", c = sjcl.codec.base58._chars;
            while (x.greaterEquals(1)) {
                var result = this._divmod58(x), x = result.q, charIndex = result.n.getLimb(0);
                out = c[charIndex] + out;
            }
            var hex = sjcl.codec.hex.fromBits(arr), zeros = hex.match(/^0*/)[0].length, zeroBytes = Math.floor(zeros / 2);
            for (var i = zeroBytes; i > 0; i--) {
                out = "1" + out;
            }
            return out;
        } else {
            return "";
        }
    },
    toBits: function(str) {
        var powersOf58 = this._powersOf58(str.length);
        var value = new sjcl.bn(), i, c = sjcl.codec.base58._chars, bitCount = 0;
        for (i = 0; i < str.length; i++) {
            var x = c.indexOf(str.charAt(i));
            var pos = str.length - i - 1;
            if (x < 0) {
                throw new sjcl.exception.invalid("this isn't base58!");
            }
            var addend = new sjcl.bn(x).mul(powersOf58[pos]);
            value.addM(addend);
        }
        if (str.length > 0) {
            var trimmedValue = value.trim(), hexValue = trimmedValue == 0 ? "" : trimmedValue.toString().substr(2), zeros = str.match(/^1*/)[0].length, bitCount = hexValue.length * 4 + zeros * 8;
            return trimmedValue.toBits(bitCount);
        } else {
            return "";
        }
    },
    _divmod58: function(n) {
        var result = {
            q: new sjcl.bn(0),
            n: new sjcl.bn(n)
        };
        var d = new sjcl.bn(58);
        var powerOf58 = new sjcl.bn(1), powersOf58table = [ powerOf58 ];
        while (result.n.greaterEquals(powerOf58)) {
            powersOf58table.push(powerOf58);
            powerOf58 = powerOf58.mul(d);
        }
        while (result.n.greaterEquals(d)) {
            var i = powersOf58table.length - 1, addToQ = 1;
            if (powersOf58table.length > 1) {
                addToQ = powersOf58table[i - 1];
            }
            powerOf58 = powersOf58table[i];
            while (powerOf58.greaterEquals(result.n.add(1))) {
                i--;
                powerOf58 = powersOf58table[i];
                addToQ = powersOf58table[i - 1];
            }
            result.n.subM(powerOf58);
            result.q.addM(addToQ);
            result.n.normalize();
        }
        return result;
    },
    _powersOf58: function(maxPower) {
        var out = [ new sjcl.bn(1) ];
        for (var i = 1; i <= maxPower; i++) {
            var result = new sjcl.bn(58).mul(out[i - 1]);
            out.push(result);
        }
        return out;
    }
};

sjcl.codec.bytes = {
    fromBits: function(arr) {
        var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out.push(tmp >>> 24);
            tmp <<= 8;
        }
        return out;
    },
    toBits: function(bytes) {
        var out = [], i, tmp = 0;
        for (i = 0; i < bytes.length; i++) {
            tmp = tmp << 8 | bytes[i];
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
};

sjcl.hash.sha256 = function(hash) {
    if (!this._key[0]) {
        this._precompute();
    }
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.sha256.hash = function(data) {
    return new sjcl.hash.sha256().update(data).finalize();
};

sjcl.hash.sha256.prototype = {
    blockSize: 512,
    reset: function() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") {
            data = sjcl.codec.utf8String.toBits(data);
        }
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 512 + ol & -512; i <= nl; i += 512) {
            this._block(b.splice(0, 16));
        }
        return this;
    },
    finalize: function() {
        var i, b = this._buffer, h = this._h;
        b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (i = b.length + 2; i & 15; i++) {
            b.push(0);
        }
        b.push(Math.floor(this._length / 4294967296));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 16));
        }
        this.reset();
        return h;
    },
    _init: [],
    _key: [],
    _precompute: function() {
        var i = 0, prime = 2, factor;
        function frac(x) {
            return (x - Math.floor(x)) * 4294967296 | 0;
        }
        outer: for (;i < 64; prime++) {
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    continue outer;
                }
            }
            if (i < 8) {
                this._init[i] = frac(Math.pow(prime, 1 / 2));
            }
            this._key[i] = frac(Math.pow(prime, 1 / 3));
            i++;
        }
    },
    _block: function(words) {
        var i, tmp, a, b, w = words.slice(0), h = this._h, k = this._key, h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
        for (i = 0; i < 64; i++) {
            if (i < 16) {
                tmp = w[i];
            } else {
                a = w[i + 1 & 15];
                b = w[i + 14 & 15];
                tmp = w[i & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0;
            }
            tmp = tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i];
            h7 = h6;
            h6 = h5;
            h5 = h4;
            h4 = h3 + tmp | 0;
            h3 = h2;
            h2 = h1;
            h1 = h0;
            h0 = tmp + (h1 & h2 ^ h3 & (h1 ^ h2)) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10) | 0;
        }
        h[0] = h[0] + h0 | 0;
        h[1] = h[1] + h1 | 0;
        h[2] = h[2] + h2 | 0;
        h[3] = h[3] + h3 | 0;
        h[4] = h[4] + h4 | 0;
        h[5] = h[5] + h5 | 0;
        h[6] = h[6] + h6 | 0;
        h[7] = h[7] + h7 | 0;
    }
};

sjcl.hash.sha512 = function(hash) {
    if (!this._key[0]) {
        this._precompute();
    }
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.sha512.hash = function(data) {
    return new sjcl.hash.sha512().update(data).finalize();
};

sjcl.hash.sha512.prototype = {
    blockSize: 1024,
    reset: function() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") {
            data = sjcl.codec.utf8String.toBits(data);
        }
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 1024 + ol & -1024; i <= nl; i += 1024) {
            this._block(b.splice(0, 32));
        }
        return this;
    },
    finalize: function() {
        var i, b = this._buffer, h = this._h;
        b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (i = b.length + 4; i & 31; i++) {
            b.push(0);
        }
        b.push(0);
        b.push(0);
        b.push(Math.floor(this._length / 4294967296));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 32));
        }
        this.reset();
        return h;
    },
    _init: [],
    _initr: [ 12372232, 13281083, 9762859, 1914609, 15106769, 4090911, 4308331, 8266105 ],
    _key: [],
    _keyr: [ 2666018, 15689165, 5061423, 9034684, 4764984, 380953, 1658779, 7176472, 197186, 7368638, 14987916, 16757986, 8096111, 1480369, 13046325, 6891156, 15813330, 5187043, 9229749, 11312229, 2818677, 10937475, 4324308, 1135541, 6741931, 11809296, 16458047, 15666916, 11046850, 698149, 229999, 945776, 13774844, 2541862, 12856045, 9810911, 11494366, 7844520, 15576806, 8533307, 15795044, 4337665, 16291729, 5553712, 15684120, 6662416, 7413802, 12308920, 13816008, 4303699, 9366425, 10176680, 13195875, 4295371, 6546291, 11712675, 15708924, 1519456, 15772530, 6568428, 6495784, 8568297, 13007125, 7492395, 2515356, 12632583, 14740254, 7262584, 1535930, 13146278, 16321966, 1853211, 294276, 13051027, 13221564, 1051980, 4080310, 6651434, 14088940, 4675607 ],
    _precompute: function() {
        var i = 0, prime = 2, factor;
        function frac(x) {
            return (x - Math.floor(x)) * 4294967296 | 0;
        }
        function frac2(x) {
            return (x - Math.floor(x)) * 1099511627776 & 255;
        }
        outer: for (;i < 80; prime++) {
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    continue outer;
                }
            }
            if (i < 8) {
                this._init[i * 2] = frac(Math.pow(prime, 1 / 2));
                this._init[i * 2 + 1] = frac2(Math.pow(prime, 1 / 2)) << 24 | this._initr[i];
            }
            this._key[i * 2] = frac(Math.pow(prime, 1 / 3));
            this._key[i * 2 + 1] = frac2(Math.pow(prime, 1 / 3)) << 24 | this._keyr[i];
            i++;
        }
    },
    _block: function(words) {
        var i, wrh, wrl, w = words.slice(0), h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
        var ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
        for (i = 0; i < 80; i++) {
            if (i < 16) {
                wrh = w[i * 2];
                wrl = w[i * 2 + 1];
            } else {
                var gamma0xh = w[(i - 15) * 2];
                var gamma0xl = w[(i - 15) * 2 + 1];
                var gamma0h = (gamma0xl << 31 | gamma0xh >>> 1) ^ (gamma0xl << 24 | gamma0xh >>> 8) ^ gamma0xh >>> 7;
                var gamma0l = (gamma0xh << 31 | gamma0xl >>> 1) ^ (gamma0xh << 24 | gamma0xl >>> 8) ^ (gamma0xh << 25 | gamma0xl >>> 7);
                var gamma1xh = w[(i - 2) * 2];
                var gamma1xl = w[(i - 2) * 2 + 1];
                var gamma1h = (gamma1xl << 13 | gamma1xh >>> 19) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                var gamma1l = (gamma1xh << 13 | gamma1xl >>> 19) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xh << 26 | gamma1xl >>> 6);
                var wr7h = w[(i - 7) * 2];
                var wr7l = w[(i - 7) * 2 + 1];
                var wr16h = w[(i - 16) * 2];
                var wr16l = w[(i - 16) * 2 + 1];
                wrl = gamma0l + wr7l;
                wrh = gamma0h + wr7h + (wrl >>> 0 < gamma0l >>> 0 ? 1 : 0);
                wrl += gamma1l;
                wrh += gamma1h + (wrl >>> 0 < gamma1l >>> 0 ? 1 : 0);
                wrl += wr16l;
                wrh += wr16h + (wrl >>> 0 < wr16l >>> 0 ? 1 : 0);
            }
            w[i * 2] = wrh |= 0;
            w[i * 2 + 1] = wrl |= 0;
            var chh = eh & fh ^ ~eh & gh;
            var chl = el & fl ^ ~el & gl;
            var majh = ah & bh ^ ah & ch ^ bh & ch;
            var majl = al & bl ^ al & cl ^ bl & cl;
            var sigma0h = (al << 4 | ah >>> 28) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
            var sigma0l = (ah << 4 | al >>> 28) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
            var sigma1h = (el << 18 | eh >>> 14) ^ (el << 14 | eh >>> 18) ^ (eh << 23 | el >>> 9);
            var sigma1l = (eh << 18 | el >>> 14) ^ (eh << 14 | el >>> 18) ^ (el << 23 | eh >>> 9);
            var krh = k[i * 2];
            var krl = k[i * 2 + 1];
            var t1l = hl + sigma1l;
            var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
            t1l += chl;
            t1h += chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
            t1l += krl;
            t1h += krh + (t1l >>> 0 < krl >>> 0 ? 1 : 0);
            t1l += wrl;
            t1h += wrh + (t1l >>> 0 < wrl >>> 0 ? 1 : 0);
            var t2l = sigma0l + majl;
            var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
            hh = gh;
            hl = gl;
            gh = fh;
            gl = fl;
            fh = eh;
            fl = el;
            el = dl + t1l | 0;
            eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
            dh = ch;
            dl = cl;
            ch = bh;
            cl = bl;
            bh = ah;
            bl = al;
            al = t1l + t2l | 0;
            ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
        }
        h0l = h[1] = h0l + al | 0;
        h[0] = h0h + ah + (h0l >>> 0 < al >>> 0 ? 1 : 0) | 0;
        h1l = h[3] = h1l + bl | 0;
        h[2] = h1h + bh + (h1l >>> 0 < bl >>> 0 ? 1 : 0) | 0;
        h2l = h[5] = h2l + cl | 0;
        h[4] = h2h + ch + (h2l >>> 0 < cl >>> 0 ? 1 : 0) | 0;
        h3l = h[7] = h3l + dl | 0;
        h[6] = h3h + dh + (h3l >>> 0 < dl >>> 0 ? 1 : 0) | 0;
        h4l = h[9] = h4l + el | 0;
        h[8] = h4h + eh + (h4l >>> 0 < el >>> 0 ? 1 : 0) | 0;
        h5l = h[11] = h5l + fl | 0;
        h[10] = h5h + fh + (h5l >>> 0 < fl >>> 0 ? 1 : 0) | 0;
        h6l = h[13] = h6l + gl | 0;
        h[12] = h6h + gh + (h6l >>> 0 < gl >>> 0 ? 1 : 0) | 0;
        h7l = h[15] = h7l + hl | 0;
        h[14] = h7h + hh + (h7l >>> 0 < hl >>> 0 ? 1 : 0) | 0;
    }
};

sjcl.hash.sha1 = function(hash) {
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.sha1.hash = function(data) {
    return new sjcl.hash.sha1().update(data).finalize();
};

sjcl.hash.sha1.prototype = {
    blockSize: 512,
    reset: function() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") {
            data = sjcl.codec.utf8String.toBits(data);
        }
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = this.blockSize + ol & -this.blockSize; i <= nl; i += this.blockSize) {
            this._block(b.splice(0, 16));
        }
        return this;
    },
    finalize: function() {
        var i, b = this._buffer, h = this._h;
        b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (i = b.length + 2; i & 15; i++) {
            b.push(0);
        }
        b.push(Math.floor(this._length / 4294967296));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 16));
        }
        this.reset();
        return h;
    },
    _init: [ 1732584193, 4023233417, 2562383102, 271733878, 3285377520 ],
    _key: [ 1518500249, 1859775393, 2400959708, 3395469782 ],
    _f: function(t, b, c, d) {
        if (t <= 19) {
            return b & c | ~b & d;
        } else if (t <= 39) {
            return b ^ c ^ d;
        } else if (t <= 59) {
            return b & c | b & d | c & d;
        } else if (t <= 79) {
            return b ^ c ^ d;
        }
    },
    _S: function(n, x) {
        return x << n | x >>> 32 - n;
    },
    _block: function(words) {
        var t, tmp, a, b, c, d, e, w = words.slice(0), h = this._h, k = this._key;
        a = h[0];
        b = h[1];
        c = h[2];
        d = h[3];
        e = h[4];
        for (t = 0; t <= 79; t++) {
            if (t >= 16) {
                w[t] = this._S(1, w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]);
            }
            tmp = this._S(5, a) + this._f(t, b, c, d) + e + w[t] + this._key[Math.floor(t / 20)] | 0;
            e = d;
            d = c;
            c = this._S(30, b);
            b = a;
            a = tmp;
        }
        h[0] = h[0] + a | 0;
        h[1] = h[1] + b | 0;
        h[2] = h[2] + c | 0;
        h[3] = h[3] + d | 0;
        h[4] = h[4] + e | 0;
    }
};

sjcl.mode.ccm = {
    name: "ccm",
    encrypt: function(prf, plaintext, iv, adata, tlen) {
        var L, i, out = plaintext.slice(0), tag, w = sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(out) / 8;
        tlen = tlen || 64;
        adata = adata || [];
        if (ivl < 7) {
            throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
        }
        for (L = 2; L < 4 && ol >>> 8 * L; L++) {}
        if (L < 15 - ivl) {
            L = 15 - ivl;
        }
        iv = w.clamp(iv, 8 * (15 - L));
        tag = sjcl.mode.ccm._computeTag(prf, plaintext, iv, adata, tlen, L);
        out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
        return w.concat(out.data, out.tag);
    },
    decrypt: function(prf, ciphertext, iv, adata, tlen) {
        tlen = tlen || 64;
        adata = adata || [];
        var L, i, w = sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(ciphertext), out = w.clamp(ciphertext, ol - tlen), tag = w.bitSlice(ciphertext, ol - tlen), tag2;
        ol = (ol - tlen) / 8;
        if (ivl < 7) {
            throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
        }
        for (L = 2; L < 4 && ol >>> 8 * L; L++) {}
        if (L < 15 - ivl) {
            L = 15 - ivl;
        }
        iv = w.clamp(iv, 8 * (15 - L));
        out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
        tag2 = sjcl.mode.ccm._computeTag(prf, out.data, iv, adata, tlen, L);
        if (!w.equal(out.tag, tag2)) {
            throw new sjcl.exception.corrupt("ccm: tag doesn't match");
        }
        return out.data;
    },
    _computeTag: function(prf, plaintext, iv, adata, tlen, L) {
        var q, mac, field = 0, offset = 24, tmp, i, macData = [], w = sjcl.bitArray, xor = w._xor4;
        tlen /= 8;
        if (tlen % 2 || tlen < 4 || tlen > 16) {
            throw new sjcl.exception.invalid("ccm: invalid tag length");
        }
        if (adata.length > 4294967295 || plaintext.length > 4294967295) {
            throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
        }
        mac = [ w.partial(8, (adata.length ? 1 << 6 : 0) | tlen - 2 << 2 | L - 1) ];
        mac = w.concat(mac, iv);
        mac[3] |= w.bitLength(plaintext) / 8;
        mac = prf.encrypt(mac);
        if (adata.length) {
            tmp = w.bitLength(adata) / 8;
            if (tmp <= 65279) {
                macData = [ w.partial(16, tmp) ];
            } else if (tmp <= 4294967295) {
                macData = w.concat([ w.partial(16, 65534) ], [ tmp ]);
            }
            macData = w.concat(macData, adata);
            for (i = 0; i < macData.length; i += 4) {
                mac = prf.encrypt(xor(mac, macData.slice(i, i + 4).concat([ 0, 0, 0 ])));
            }
        }
        for (i = 0; i < plaintext.length; i += 4) {
            mac = prf.encrypt(xor(mac, plaintext.slice(i, i + 4).concat([ 0, 0, 0 ])));
        }
        return w.clamp(mac, tlen * 8);
    },
    _ctrMode: function(prf, data, iv, tag, tlen, L) {
        var enc, i, w = sjcl.bitArray, xor = w._xor4, ctr, b, l = data.length, bl = w.bitLength(data);
        ctr = w.concat([ w.partial(8, L - 1) ], iv).concat([ 0, 0, 0 ]).slice(0, 4);
        tag = w.bitSlice(xor(tag, prf.encrypt(ctr)), 0, tlen);
        if (!l) {
            return {
                tag: tag,
                data: []
            };
        }
        for (i = 0; i < l; i += 4) {
            ctr[3]++;
            enc = prf.encrypt(ctr);
            data[i] ^= enc[0];
            data[i + 1] ^= enc[1];
            data[i + 2] ^= enc[2];
            data[i + 3] ^= enc[3];
        }
        return {
            tag: tag,
            data: w.clamp(data, bl)
        };
    }
};

if (sjcl.beware === undefined) {
    sjcl.beware = {};
}

sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."] = function() {
    sjcl.mode.cbc = {
        name: "cbc",
        encrypt: function(prp, plaintext, iv, adata) {
            if (adata && adata.length) {
                throw new sjcl.exception.invalid("cbc can't authenticate data");
            }
            if (sjcl.bitArray.bitLength(iv) !== 128) {
                throw new sjcl.exception.invalid("cbc iv must be 128 bits");
            }
            var i, w = sjcl.bitArray, xor = w._xor4, bl = w.bitLength(plaintext), bp = 0, output = [];
            if (bl & 7) {
                throw new sjcl.exception.invalid("pkcs#5 padding only works for multiples of a byte");
            }
            for (i = 0; bp + 128 <= bl; i += 4, bp += 128) {
                iv = prp.encrypt(xor(iv, plaintext.slice(i, i + 4)));
                output.splice(i, 0, iv[0], iv[1], iv[2], iv[3]);
            }
            bl = (16 - (bl >> 3 & 15)) * 16843009;
            iv = prp.encrypt(xor(iv, w.concat(plaintext, [ bl, bl, bl, bl ]).slice(i, i + 4)));
            output.splice(i, 0, iv[0], iv[1], iv[2], iv[3]);
            return output;
        },
        decrypt: function(prp, ciphertext, iv, adata) {
            if (adata && adata.length) {
                throw new sjcl.exception.invalid("cbc can't authenticate data");
            }
            if (sjcl.bitArray.bitLength(iv) !== 128) {
                throw new sjcl.exception.invalid("cbc iv must be 128 bits");
            }
            if (sjcl.bitArray.bitLength(ciphertext) & 127 || !ciphertext.length) {
                throw new sjcl.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");
            }
            var i, w = sjcl.bitArray, xor = w._xor4, bi, bo, output = [];
            adata = adata || [];
            for (i = 0; i < ciphertext.length; i += 4) {
                bi = ciphertext.slice(i, i + 4);
                bo = xor(iv, prp.decrypt(bi));
                output.splice(i, 0, bo[0], bo[1], bo[2], bo[3]);
                iv = bi;
            }
            bi = output[i - 1] & 255;
            if (bi === 0 || bi > 16) {
                throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
            }
            bo = bi * 16843009;
            if (!w.equal(w.bitSlice([ bo, bo, bo, bo ], 0, bi * 8), w.bitSlice(output, output.length * 32 - bi * 8, output.length * 32))) {
                throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
            }
            return w.bitSlice(output, 0, output.length * 32 - bi * 8);
        }
    };
};

sjcl.mode.ocb2 = {
    name: "ocb2",
    encrypt: function(prp, plaintext, iv, adata, tlen, premac) {
        if (sjcl.bitArray.bitLength(iv) !== 128) {
            throw new sjcl.exception.invalid("ocb iv must be 128 bits");
        }
        var i, times2 = sjcl.mode.ocb2._times2, w = sjcl.bitArray, xor = w._xor4, checksum = [ 0, 0, 0, 0 ], delta = times2(prp.encrypt(iv)), bi, bl, output = [], pad;
        adata = adata || [];
        tlen = tlen || 64;
        for (i = 0; i + 4 < plaintext.length; i += 4) {
            bi = plaintext.slice(i, i + 4);
            checksum = xor(checksum, bi);
            output = output.concat(xor(delta, prp.encrypt(xor(delta, bi))));
            delta = times2(delta);
        }
        bi = plaintext.slice(i);
        bl = w.bitLength(bi);
        pad = prp.encrypt(xor(delta, [ 0, 0, 0, bl ]));
        bi = w.clamp(xor(bi.concat([ 0, 0, 0 ]), pad), bl);
        checksum = xor(checksum, xor(bi.concat([ 0, 0, 0 ]), pad));
        checksum = prp.encrypt(xor(checksum, xor(delta, times2(delta))));
        if (adata.length) {
            checksum = xor(checksum, premac ? adata : sjcl.mode.ocb2.pmac(prp, adata));
        }
        return output.concat(w.concat(bi, w.clamp(checksum, tlen)));
    },
    decrypt: function(prp, ciphertext, iv, adata, tlen, premac) {
        if (sjcl.bitArray.bitLength(iv) !== 128) {
            throw new sjcl.exception.invalid("ocb iv must be 128 bits");
        }
        tlen = tlen || 64;
        var i, times2 = sjcl.mode.ocb2._times2, w = sjcl.bitArray, xor = w._xor4, checksum = [ 0, 0, 0, 0 ], delta = times2(prp.encrypt(iv)), bi, bl, len = sjcl.bitArray.bitLength(ciphertext) - tlen, output = [], pad;
        adata = adata || [];
        for (i = 0; i + 4 < len / 32; i += 4) {
            bi = xor(delta, prp.decrypt(xor(delta, ciphertext.slice(i, i + 4))));
            checksum = xor(checksum, bi);
            output = output.concat(bi);
            delta = times2(delta);
        }
        bl = len - i * 32;
        pad = prp.encrypt(xor(delta, [ 0, 0, 0, bl ]));
        bi = xor(pad, w.clamp(ciphertext.slice(i), bl).concat([ 0, 0, 0 ]));
        checksum = xor(checksum, bi);
        checksum = prp.encrypt(xor(checksum, xor(delta, times2(delta))));
        if (adata.length) {
            checksum = xor(checksum, premac ? adata : sjcl.mode.ocb2.pmac(prp, adata));
        }
        if (!w.equal(w.clamp(checksum, tlen), w.bitSlice(ciphertext, len))) {
            throw new sjcl.exception.corrupt("ocb: tag doesn't match");
        }
        return output.concat(w.clamp(bi, bl));
    },
    pmac: function(prp, adata) {
        var i, times2 = sjcl.mode.ocb2._times2, w = sjcl.bitArray, xor = w._xor4, checksum = [ 0, 0, 0, 0 ], delta = prp.encrypt([ 0, 0, 0, 0 ]), bi;
        delta = xor(delta, times2(times2(delta)));
        for (i = 0; i + 4 < adata.length; i += 4) {
            delta = times2(delta);
            checksum = xor(checksum, prp.encrypt(xor(delta, adata.slice(i, i + 4))));
        }
        bi = adata.slice(i);
        if (w.bitLength(bi) < 128) {
            delta = xor(delta, times2(delta));
            bi = w.concat(bi, [ 2147483648 | 0, 0, 0, 0 ]);
        }
        checksum = xor(checksum, bi);
        return prp.encrypt(xor(times2(xor(delta, times2(delta))), checksum));
    },
    _times2: function(x) {
        return [ x[0] << 1 ^ x[1] >>> 31, x[1] << 1 ^ x[2] >>> 31, x[2] << 1 ^ x[3] >>> 31, x[3] << 1 ^ (x[0] >>> 31) * 135 ];
    }
};

sjcl.mode.gcm = {
    name: "gcm",
    encrypt: function(prf, plaintext, iv, adata, tlen) {
        var out, data = plaintext.slice(0), w = sjcl.bitArray;
        tlen = tlen || 128;
        adata = adata || [];
        out = sjcl.mode.gcm._ctrMode(true, prf, data, adata, iv, tlen);
        return w.concat(out.data, out.tag);
    },
    decrypt: function(prf, ciphertext, iv, adata, tlen) {
        var out, data = ciphertext.slice(0), tag, w = sjcl.bitArray, l = w.bitLength(data);
        tlen = tlen || 128;
        adata = adata || [];
        if (tlen <= l) {
            tag = w.bitSlice(data, l - tlen);
            data = w.bitSlice(data, 0, l - tlen);
        } else {
            tag = data;
            data = [];
        }
        out = sjcl.mode.gcm._ctrMode(false, prf, data, adata, iv, tlen);
        if (!w.equal(out.tag, tag)) {
            throw new sjcl.exception.corrupt("gcm: tag doesn't match");
        }
        return out.data;
    },
    _galoisMultiply: function(x, y) {
        var i, j, xi, Zi, Vi, lsb_Vi, w = sjcl.bitArray, xor = w._xor4;
        Zi = [ 0, 0, 0, 0 ];
        Vi = y.slice(0);
        for (i = 0; i < 128; i++) {
            xi = (x[Math.floor(i / 32)] & 1 << 31 - i % 32) !== 0;
            if (xi) {
                Zi = xor(Zi, Vi);
            }
            lsb_Vi = (Vi[3] & 1) !== 0;
            for (j = 3; j > 0; j--) {
                Vi[j] = Vi[j] >>> 1 | (Vi[j - 1] & 1) << 31;
            }
            Vi[0] = Vi[0] >>> 1;
            if (lsb_Vi) {
                Vi[0] = Vi[0] ^ 225 << 24;
            }
        }
        return Zi;
    },
    _ghash: function(H, Y0, data) {
        var Yi, i, l = data.length;
        Yi = Y0.slice(0);
        for (i = 0; i < l; i += 4) {
            Yi[0] ^= 4294967295 & data[i];
            Yi[1] ^= 4294967295 & data[i + 1];
            Yi[2] ^= 4294967295 & data[i + 2];
            Yi[3] ^= 4294967295 & data[i + 3];
            Yi = sjcl.mode.gcm._galoisMultiply(Yi, H);
        }
        return Yi;
    },
    _ctrMode: function(encrypt, prf, data, adata, iv, tlen) {
        var H, J0, S0, enc, i, ctr, tag, last, l, bl, abl, ivbl, w = sjcl.bitArray, xor = w._xor4;
        l = data.length;
        bl = w.bitLength(data);
        abl = w.bitLength(adata);
        ivbl = w.bitLength(iv);
        H = prf.encrypt([ 0, 0, 0, 0 ]);
        if (ivbl === 96) {
            J0 = iv.slice(0);
            J0 = w.concat(J0, [ 1 ]);
        } else {
            J0 = sjcl.mode.gcm._ghash(H, [ 0, 0, 0, 0 ], iv);
            J0 = sjcl.mode.gcm._ghash(H, J0, [ 0, 0, Math.floor(ivbl / 4294967296), ivbl & 4294967295 ]);
        }
        S0 = sjcl.mode.gcm._ghash(H, [ 0, 0, 0, 0 ], adata);
        ctr = J0.slice(0);
        tag = S0.slice(0);
        if (!encrypt) {
            tag = sjcl.mode.gcm._ghash(H, S0, data);
        }
        for (i = 0; i < l; i += 4) {
            ctr[3]++;
            enc = prf.encrypt(ctr);
            data[i] ^= enc[0];
            data[i + 1] ^= enc[1];
            data[i + 2] ^= enc[2];
            data[i + 3] ^= enc[3];
        }
        data = w.clamp(data, bl);
        if (encrypt) {
            tag = sjcl.mode.gcm._ghash(H, S0, data);
        }
        last = [ Math.floor(abl / 4294967296), abl & 4294967295, Math.floor(bl / 4294967296), bl & 4294967295 ];
        tag = sjcl.mode.gcm._ghash(H, tag, last);
        enc = prf.encrypt(J0);
        tag[0] ^= enc[0];
        tag[1] ^= enc[1];
        tag[2] ^= enc[2];
        tag[3] ^= enc[3];
        return {
            tag: w.bitSlice(tag, 0, tlen),
            data: data
        };
    }
};

sjcl.misc.hmac = function(key, Hash) {
    this._hash = Hash = Hash || sjcl.hash.sha256;
    var exKey = [ [], [] ], i, bs = Hash.prototype.blockSize / 32;
    this._baseHash = [ new Hash(), new Hash() ];
    if (key.length > bs) {
        key = Hash.hash(key);
    }
    for (i = 0; i < bs; i++) {
        exKey[0][i] = key[i] ^ 909522486;
        exKey[1][i] = key[i] ^ 1549556828;
    }
    this._baseHash[0].update(exKey[0]);
    this._baseHash[1].update(exKey[1]);
    this._resultHash = new Hash(this._baseHash[0]);
};

sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(data) {
    if (!this._updated) {
        this.update(data);
        return this.digest(data);
    } else {
        throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
    }
};

sjcl.misc.hmac.prototype.reset = function() {
    this._resultHash = new this._hash(this._baseHash[0]);
    this._updated = false;
};

sjcl.misc.hmac.prototype.update = function(data) {
    this._updated = true;
    this._resultHash.update(data);
};

sjcl.misc.hmac.prototype.digest = function() {
    var w = this._resultHash.finalize(), result = new this._hash(this._baseHash[1]).update(w).finalize();
    this.reset();
    return result;
};

sjcl.misc.pbkdf2 = function(password, salt, count, length, Prff) {
    count = count || 1e3;
    if (length < 0 || count < 0) {
        throw sjcl.exception.invalid("invalid params to pbkdf2");
    }
    if (typeof password === "string") {
        password = sjcl.codec.utf8String.toBits(password);
    }
    if (typeof salt === "string") {
        salt = sjcl.codec.utf8String.toBits(salt);
    }
    Prff = Prff || sjcl.misc.hmac;
    var prf = new Prff(password), u, ui, i, j, k, out = [], b = sjcl.bitArray;
    for (k = 1; 32 * out.length < (length || 1); k++) {
        u = ui = prf.encrypt(b.concat(salt, [ k ]));
        for (i = 1; i < count; i++) {
            ui = prf.encrypt(ui);
            for (j = 0; j < ui.length; j++) {
                u[j] ^= ui[j];
            }
        }
        out = out.concat(u);
    }
    if (length) {
        out = b.clamp(out, length);
    }
    return out;
};

sjcl.prng = function(defaultParanoia) {
    this._pools = [ new sjcl.hash.sha256() ];
    this._poolEntropy = [ 0 ];
    this._reseedCount = 0;
    this._robins = {};
    this._eventId = 0;
    this._collectorIds = {};
    this._collectorIdNext = 0;
    this._strength = 0;
    this._poolStrength = 0;
    this._nextReseed = 0;
    this._key = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    this._counter = [ 0, 0, 0, 0 ];
    this._cipher = undefined;
    this._defaultParanoia = defaultParanoia;
    this._collectorsStarted = false;
    this._callbacks = {
        progress: {},
        seeded: {}
    };
    this._callbackI = 0;
    this._NOT_READY = 0;
    this._READY = 1;
    this._REQUIRES_RESEED = 2;
    this._MAX_WORDS_PER_BURST = 65536;
    this._PARANOIA_LEVELS = [ 0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024 ];
    this._MILLISECONDS_PER_RESEED = 3e4;
    this._BITS_PER_RESEED = 80;
};

sjcl.prng.prototype = {
    randomWords: function(nwords, paranoia) {
        var out = [], i, readiness = this.isReady(paranoia), g;
        if (readiness === this._NOT_READY) {
            throw new sjcl.exception.notReady("generator isn't seeded");
        } else if (readiness & this._REQUIRES_RESEED) {
            this._reseedFromPools(!(readiness & this._READY));
        }
        for (i = 0; i < nwords; i += 4) {
            if ((i + 1) % this._MAX_WORDS_PER_BURST === 0) {
                this._gate();
            }
            g = this._gen4words();
            out.push(g[0], g[1], g[2], g[3]);
        }
        this._gate();
        return out.slice(0, nwords);
    },
    setDefaultParanoia: function(paranoia, allowZeroParanoia) {
        if (paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
            throw "Setting paranoia=0 will ruin your security; use it only for testing";
        }
        this._defaultParanoia = paranoia;
    },
    addEntropy: function(data, estimatedEntropy, source) {
        source = source || "user";
        var id, i, tmp, t = new Date().valueOf(), robin = this._robins[source], oldReady = this.isReady(), err = 0, objName;
        id = this._collectorIds[source];
        if (id === undefined) {
            id = this._collectorIds[source] = this._collectorIdNext++;
        }
        if (robin === undefined) {
            robin = this._robins[source] = 0;
        }
        this._robins[source] = (this._robins[source] + 1) % this._pools.length;
        switch (typeof data) {
          case "number":
            if (estimatedEntropy === undefined) {
                estimatedEntropy = 1;
            }
            this._pools[robin].update([ id, this._eventId++, 1, estimatedEntropy, t, 1, data | 0 ]);
            break;

          case "object":
            objName = Object.prototype.toString.call(data);
            if (objName === "[object Uint32Array]") {
                tmp = [];
                for (i = 0; i < data.length; i++) {
                    tmp.push(data[i]);
                }
                data = tmp;
            } else {
                if (objName !== "[object Array]") {
                    err = 1;
                }
                for (i = 0; i < data.length && !err; i++) {
                    if (typeof data[i] !== "number") {
                        err = 1;
                    }
                }
            }
            if (!err) {
                if (estimatedEntropy === undefined) {
                    estimatedEntropy = 0;
                    for (i = 0; i < data.length; i++) {
                        tmp = data[i];
                        while (tmp > 0) {
                            estimatedEntropy++;
                            tmp = tmp >>> 1;
                        }
                    }
                }
                this._pools[robin].update([ id, this._eventId++, 2, estimatedEntropy, t, data.length ].concat(data));
            }
            break;

          case "string":
            if (estimatedEntropy === undefined) {
                estimatedEntropy = data.length;
            }
            this._pools[robin].update([ id, this._eventId++, 3, estimatedEntropy, t, data.length ]);
            this._pools[robin].update(data);
            break;

          default:
            err = 1;
        }
        if (err) {
            throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
        }
        this._poolEntropy[robin] += estimatedEntropy;
        this._poolStrength += estimatedEntropy;
        if (oldReady === this._NOT_READY) {
            if (this.isReady() !== this._NOT_READY) {
                this._fireEvent("seeded", Math.max(this._strength, this._poolStrength));
            }
            this._fireEvent("progress", this.getProgress());
        }
    },
    isReady: function(paranoia) {
        var entropyRequired = this._PARANOIA_LEVELS[paranoia !== undefined ? paranoia : this._defaultParanoia];
        if (this._strength && this._strength >= entropyRequired) {
            return this._poolEntropy[0] > this._BITS_PER_RESEED && new Date().valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY;
        } else {
            return this._poolStrength >= entropyRequired ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY;
        }
    },
    getProgress: function(paranoia) {
        var entropyRequired = this._PARANOIA_LEVELS[paranoia ? paranoia : this._defaultParanoia];
        if (this._strength >= entropyRequired) {
            return 1;
        } else {
            return this._poolStrength > entropyRequired ? 1 : this._poolStrength / entropyRequired;
        }
    },
    startCollectors: function() {
        if (this._collectorsStarted) {
            return;
        }
        this._eventListener = {
            loadTimeCollector: this._bind(this._loadTimeCollector),
            mouseCollector: this._bind(this._mouseCollector),
            keyboardCollector: this._bind(this._keyboardCollector),
            accelerometerCollector: this._bind(this._accelerometerCollector)
        };
        if (window.addEventListener) {
            window.addEventListener("load", this._eventListener.loadTimeCollector, false);
            window.addEventListener("mousemove", this._eventListener.mouseCollector, false);
            window.addEventListener("keypress", this._eventListener.keyboardCollector, false);
            window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
        } else if (document.attachEvent) {
            document.attachEvent("onload", this._eventListener.loadTimeCollector);
            document.attachEvent("onmousemove", this._eventListener.mouseCollector);
            document.attachEvent("keypress", this._eventListener.keyboardCollector);
        } else {
            throw new sjcl.exception.bug("can't attach event");
        }
        this._collectorsStarted = true;
    },
    stopCollectors: function() {
        if (!this._collectorsStarted) {
            return;
        }
        if (window.removeEventListener) {
            window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
            window.removeEventListener("mousemove", this._eventListener.mouseCollector, false);
            window.removeEventListener("keypress", this._eventListener.keyboardCollector, false);
            window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
        } else if (document.detachEvent) {
            document.detachEvent("onload", this._eventListener.loadTimeCollector);
            document.detachEvent("onmousemove", this._eventListener.mouseCollector);
            document.detachEvent("keypress", this._eventListener.keyboardCollector);
        }
        this._collectorsStarted = false;
    },
    addEventListener: function(name, callback) {
        this._callbacks[name][this._callbackI++] = callback;
    },
    removeEventListener: function(name, cb) {
        var i, j, cbs = this._callbacks[name], jsTemp = [];
        for (j in cbs) {
            if (cbs.hasOwnProperty(j) && cbs[j] === cb) {
                jsTemp.push(j);
            }
        }
        for (i = 0; i < jsTemp.length; i++) {
            j = jsTemp[i];
            delete cbs[j];
        }
    },
    _bind: function(func) {
        var that = this;
        return function() {
            func.apply(that, arguments);
        };
    },
    _gen4words: function() {
        for (var i = 0; i < 4; i++) {
            this._counter[i] = this._counter[i] + 1 | 0;
            if (this._counter[i]) {
                break;
            }
        }
        return this._cipher.encrypt(this._counter);
    },
    _gate: function() {
        this._key = this._gen4words().concat(this._gen4words());
        this._cipher = new sjcl.cipher.aes(this._key);
    },
    _reseed: function(seedWords) {
        this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
        this._cipher = new sjcl.cipher.aes(this._key);
        for (var i = 0; i < 4; i++) {
            this._counter[i] = this._counter[i] + 1 | 0;
            if (this._counter[i]) {
                break;
            }
        }
    },
    _reseedFromPools: function(full) {
        var reseedData = [], strength = 0, i;
        this._nextReseed = reseedData[0] = new Date().valueOf() + this._MILLISECONDS_PER_RESEED;
        for (i = 0; i < 16; i++) {
            reseedData.push(Math.random() * 4294967296 | 0);
        }
        for (i = 0; i < this._pools.length; i++) {
            reseedData = reseedData.concat(this._pools[i].finalize());
            strength += this._poolEntropy[i];
            this._poolEntropy[i] = 0;
            if (!full && this._reseedCount & 1 << i) {
                break;
            }
        }
        if (this._reseedCount >= 1 << this._pools.length) {
            this._pools.push(new sjcl.hash.sha256());
            this._poolEntropy.push(0);
        }
        this._poolStrength -= strength;
        if (strength > this._strength) {
            this._strength = strength;
        }
        this._reseedCount++;
        this._reseed(reseedData);
    },
    _keyboardCollector: function() {
        this._addCurrentTimeToEntropy(1);
    },
    _mouseCollector: function(ev) {
        var x = ev.x || ev.clientX || ev.offsetX || 0, y = ev.y || ev.clientY || ev.offsetY || 0;
        sjcl.random.addEntropy([ x, y ], 2, "mouse");
        this._addCurrentTimeToEntropy(0);
    },
    _loadTimeCollector: function() {
        this._addCurrentTimeToEntropy(2);
    },
    _addCurrentTimeToEntropy: function(estimatedEntropy) {
        if (window && window.performance && typeof window.performance.now === "function") {
            sjcl.random.addEntropy(window.performance.now(), estimatedEntropy, "loadtime");
        } else {
            sjcl.random.addEntropy(new Date().valueOf(), estimatedEntropy, "loadtime");
        }
    },
    _accelerometerCollector: function(ev) {
        var ac = ev.accelerationIncludingGravity.x || ev.accelerationIncludingGravity.y || ev.accelerationIncludingGravity.z;
        if (window.orientation) {
            var or = window.orientation;
            if (typeof or === "number") {
                sjcl.random.addEntropy(or, 1, "accelerometer");
            }
        }
        if (ac) {
            sjcl.random.addEntropy(ac, 2, "accelerometer");
        }
        this._addCurrentTimeToEntropy(0);
    },
    _fireEvent: function(name, arg) {
        var j, cbs = sjcl.random._callbacks[name], cbsTemp = [];
        for (j in cbs) {
            if (cbs.hasOwnProperty(j)) {
                cbsTemp.push(cbs[j]);
            }
        }
        for (j = 0; j < cbsTemp.length; j++) {
            cbsTemp[j](arg);
        }
    }
};

sjcl.random = new sjcl.prng(6);

(function() {
    function getCryptoModule() {
        try {
            return require("crypto");
        } catch (e) {
            return null;
        }
    }
    try {
        var buf, crypt, getRandomValues, ab;
        if (typeof module !== "undefined" && module.exports && (crypt = getCryptoModule()) && crypt.randomBytes) {
            buf = crypt.randomBytes(1024 / 8);
            buf = new Uint32Array(new Uint8Array(buf).buffer);
            sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes");
        } else if (window && Uint32Array) {
            ab = new Uint32Array(32);
            if (window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(ab);
            } else if (window.msCrypto && window.msCrypto.getRandomValues) {
                window.msCrypto.getRandomValues(ab);
            } else {
                return;
            }
            sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues");
        } else {}
    } catch (e) {
        if (typeof window !== "undefined" && window.console) {
            console.log("There was an error collecting entropy from the browser:");
            console.log(e);
        }
    }
})();

sjcl.json = {
    defaults: {
        v: 1,
        iter: 1e3,
        ks: 128,
        ts: 64,
        mode: "ccm",
        adata: "",
        cipher: "aes"
    },
    _encrypt: function(password, plaintext, params, rp) {
        params = params || {};
        rp = rp || {};
        var j = sjcl.json, p = j._add({
            iv: sjcl.random.randomWords(4, 0)
        }, j.defaults), tmp, prp, adata;
        j._add(p, params);
        adata = p.adata;
        if (typeof p.salt === "string") {
            p.salt = sjcl.codec.base64.toBits(p.salt);
        }
        if (typeof p.iv === "string") {
            p.iv = sjcl.codec.base64.toBits(p.iv);
        }
        if (!sjcl.mode[p.mode] || !sjcl.cipher[p.cipher] || typeof password === "string" && p.iter <= 100 || p.ts !== 64 && p.ts !== 96 && p.ts !== 128 || p.ks !== 128 && p.ks !== 192 && p.ks !== 256 || (p.iv.length < 2 || p.iv.length > 4)) {
            throw new sjcl.exception.invalid("json encrypt: invalid parameters");
        }
        if (typeof password === "string") {
            tmp = sjcl.misc.cachedPbkdf2(password, p);
            password = tmp.key.slice(0, p.ks / 32);
            p.salt = tmp.salt;
        } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.publicKey) {
            tmp = password.kem();
            p.kemtag = tmp.tag;
            password = tmp.key.slice(0, p.ks / 32);
        }
        if (typeof plaintext === "string") {
            plaintext = sjcl.codec.utf8String.toBits(plaintext);
        }
        if (typeof adata === "string") {
            adata = sjcl.codec.utf8String.toBits(adata);
        }
        prp = new sjcl.cipher[p.cipher](password);
        j._add(rp, p);
        rp.key = password;
        p.ct = sjcl.mode[p.mode].encrypt(prp, plaintext, p.iv, adata, p.ts);
        return p;
    },
    encrypt: function(password, plaintext, params, rp) {
        var j = sjcl.json, p = j._encrypt.apply(j, arguments);
        return j.encode(p);
    },
    _decrypt: function(password, ciphertext, params, rp) {
        params = params || {};
        rp = rp || {};
        var j = sjcl.json, p = j._add(j._add(j._add({}, j.defaults), ciphertext), params, true), ct, tmp, prp, adata = p.adata;
        if (typeof p.salt === "string") {
            p.salt = sjcl.codec.base64.toBits(p.salt);
        }
        if (typeof p.iv === "string") {
            p.iv = sjcl.codec.base64.toBits(p.iv);
        }
        if (!sjcl.mode[p.mode] || !sjcl.cipher[p.cipher] || typeof password === "string" && p.iter <= 100 || p.ts !== 64 && p.ts !== 96 && p.ts !== 128 || p.ks !== 128 && p.ks !== 192 && p.ks !== 256 || !p.iv || (p.iv.length < 2 || p.iv.length > 4)) {
            throw new sjcl.exception.invalid("json decrypt: invalid parameters");
        }
        if (typeof password === "string") {
            tmp = sjcl.misc.cachedPbkdf2(password, p);
            password = tmp.key.slice(0, p.ks / 32);
            p.salt = tmp.salt;
        } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.secretKey) {
            password = password.unkem(sjcl.codec.base64.toBits(p.kemtag)).slice(0, p.ks / 32);
        }
        if (typeof adata === "string") {
            adata = sjcl.codec.utf8String.toBits(adata);
        }
        prp = new sjcl.cipher[p.cipher](password);
        ct = sjcl.mode[p.mode].decrypt(prp, p.ct, p.iv, adata, p.ts);
        j._add(rp, p);
        rp.key = password;
        return sjcl.codec.utf8String.fromBits(ct);
    },
    decrypt: function(password, ciphertext, params, rp) {
        var j = sjcl.json;
        return j._decrypt(password, j.decode(ciphertext), params, rp);
    },
    encode: function(obj) {
        var i, out = "{", comma = "";
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (!i.match(/^[a-z0-9]+$/i)) {
                    throw new sjcl.exception.invalid("json encode: invalid property name");
                }
                out += comma + '"' + i + '":';
                comma = ",";
                switch (typeof obj[i]) {
                  case "number":
                  case "boolean":
                    out += obj[i];
                    break;

                  case "string":
                    out += '"' + escape(obj[i]) + '"';
                    break;

                  case "object":
                    out += '"' + sjcl.codec.base64.fromBits(obj[i], 0) + '"';
                    break;

                  default:
                    throw new sjcl.exception.bug("json encode: unsupported type");
                }
            }
        }
        return out + "}";
    },
    decode: function(str) {
        str = str.replace(/\s/g, "");
        if (!str.match(/^\{.*\}$/)) {
            throw new sjcl.exception.invalid("json decode: this isn't json!");
        }
        var a = str.replace(/^\{|\}$/g, "").split(/,/), out = {}, i, m;
        for (i = 0; i < a.length; i++) {
            if (!(m = a[i].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))) {
                throw new sjcl.exception.invalid("json decode: this isn't json!");
            }
            if (m[3]) {
                out[m[2]] = parseInt(m[3], 10);
            } else {
                out[m[2]] = m[2].match(/^(ct|salt|iv)$/) ? sjcl.codec.base64.toBits(m[4]) : unescape(m[4]);
            }
        }
        return out;
    },
    _add: function(target, src, requireSame) {
        if (target === undefined) {
            target = {};
        }
        if (src === undefined) {
            return target;
        }
        var i;
        for (i in src) {
            if (src.hasOwnProperty(i)) {
                if (requireSame && target[i] !== undefined && target[i] !== src[i]) {
                    throw new sjcl.exception.invalid("required parameter overridden");
                }
                target[i] = src[i];
            }
        }
        return target;
    },
    _subtract: function(plus, minus) {
        var out = {}, i;
        for (i in plus) {
            if (plus.hasOwnProperty(i) && plus[i] !== minus[i]) {
                out[i] = plus[i];
            }
        }
        return out;
    },
    _filter: function(src, filter) {
        var out = {}, i;
        for (i = 0; i < filter.length; i++) {
            if (src[filter[i]] !== undefined) {
                out[filter[i]] = src[filter[i]];
            }
        }
        return out;
    }
};

sjcl.encrypt = sjcl.json.encrypt;

sjcl.decrypt = sjcl.json.decrypt;

sjcl.misc._pbkdf2Cache = {};

sjcl.misc.cachedPbkdf2 = function(password, obj) {
    var cache = sjcl.misc._pbkdf2Cache, c, cp, str, salt, iter;
    obj = obj || {};
    iter = obj.iter || 1e3;
    cp = cache[password] = cache[password] || {};
    c = cp[iter] = cp[iter] || {
        firstSalt: obj.salt && obj.salt.length ? obj.salt.slice(0) : sjcl.random.randomWords(2, 0)
    };
    salt = obj.salt === undefined ? c.firstSalt : obj.salt;
    c[salt] = c[salt] || sjcl.misc.pbkdf2(password, salt, obj.iter);
    return {
        key: c[salt].slice(0),
        salt: salt.slice(0)
    };
};

sjcl.bn = function(it) {
    this.initWith(it);
};

sjcl.bn.prototype = {
    radix: 24,
    maxMul: 8,
    _class: sjcl.bn,
    copy: function() {
        return new this._class(this);
    },
    initWith: function(it) {
        var i = 0, k, n, l;
        switch (typeof it) {
          case "object":
            this.limbs = it.limbs.slice(0);
            break;

          case "number":
            this.limbs = [ it ];
            this.normalize();
            break;

          case "string":
            it = it.replace(/^0x/, "");
            this.limbs = [];
            k = this.radix / 4;
            for (i = 0; i < it.length; i += k) {
                this.limbs.push(parseInt(it.substring(Math.max(it.length - i - k, 0), it.length - i), 16));
            }
            break;

          default:
            this.limbs = [ 0 ];
        }
        return this;
    },
    equals: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var difference = 0, i;
        this.fullReduce();
        that.fullReduce();
        for (i = 0; i < this.limbs.length || i < that.limbs.length; i++) {
            difference |= this.getLimb(i) ^ that.getLimb(i);
        }
        return difference === 0;
    },
    getLimb: function(i) {
        return i >= this.limbs.length ? 0 : this.limbs[i];
    },
    greaterEquals: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var less = 0, greater = 0, i, a, b;
        i = Math.max(this.limbs.length, that.limbs.length) - 1;
        for (;i >= 0; i--) {
            a = this.getLimb(i);
            b = that.getLimb(i);
            greater |= b - a & ~less;
            less |= a - b & ~greater;
        }
        return (greater | ~less) >>> 31;
    },
    toString: function() {
        this.fullReduce();
        var out = "", i, s, l = this.limbs;
        for (i = 0; i < this.limbs.length; i++) {
            s = l[i].toString(16);
            while (i < this.limbs.length - 1 && s.length < 6) {
                s = "0" + s;
            }
            out = s + out;
        }
        return "0x" + out;
    },
    addM: function(that) {
        if (typeof that !== "object") {
            that = new this._class(that);
        }
        var i, l = this.limbs, ll = that.limbs;
        for (i = l.length; i < ll.length; i++) {
            l[i] = 0;
        }
        for (i = 0; i < ll.length; i++) {
            l[i] += ll[i];
        }
        return this;
    },
    doubleM: function() {
        var i, carry = 0, tmp, r = this.radix, m = this.radixMask, l = this.limbs;
        for (i = 0; i < l.length; i++) {
            tmp = l[i];
            tmp = tmp + tmp + carry;
            l[i] = tmp & m;
            carry = tmp >> r;
        }
        if (carry) {
            l.push(carry);
        }
        return this;
    },
    halveM: function() {
        var i, carry = 0, tmp, r = this.radix, l = this.limbs;
        for (i = l.length - 1; i >= 0; i--) {
            tmp = l[i];
            l[i] = tmp + carry >> 1;
            carry = (tmp & 1) << r;
        }
        if (!l[l.length - 1]) {
            l.pop();
        }
        return this;
    },
    subM: function(that) {
        if (typeof that !== "object") {
            that = new this._class(that);
        }
        var i, l = this.limbs, ll = that.limbs;
        for (i = l.length; i < ll.length; i++) {
            l[i] = 0;
        }
        for (i = 0; i < ll.length; i++) {
            l[i] -= ll[i];
        }
        return this;
    },
    mod: function(that) {
        var neg = !this.greaterEquals(new sjcl.bn(0));
        that = new sjcl.bn(that).normalize();
        var out = new sjcl.bn(this).normalize(), ci = 0;
        if (neg) out = new sjcl.bn(0).subM(out).normalize();
        for (;out.greaterEquals(that); ci++) {
            that.doubleM();
        }
        if (neg) out = that.sub(out).normalize();
        for (;ci > 0; ci--) {
            that.halveM();
            if (out.greaterEquals(that)) {
                out.subM(that).normalize();
            }
        }
        return out.trim();
    },
    inverseMod: function(p) {
        var a = new sjcl.bn(1), b = new sjcl.bn(0), x = new sjcl.bn(this), y = new sjcl.bn(p), tmp, i, nz = 1;
        if (!(p.limbs[0] & 1)) {
            throw new sjcl.exception.invalid("inverseMod: p must be odd");
        }
        do {
            if (x.limbs[0] & 1) {
                if (!x.greaterEquals(y)) {
                    tmp = x;
                    x = y;
                    y = tmp;
                    tmp = a;
                    a = b;
                    b = tmp;
                }
                x.subM(y);
                x.normalize();
                if (!a.greaterEquals(b)) {
                    a.addM(p);
                }
                a.subM(b);
            }
            x.halveM();
            if (a.limbs[0] & 1) {
                a.addM(p);
            }
            a.normalize();
            a.halveM();
            for (i = nz = 0; i < x.limbs.length; i++) {
                nz |= x.limbs[i];
            }
        } while (nz);
        if (!y.equals(1)) {
            throw new sjcl.exception.invalid("inverseMod: p and x must be relatively prime");
        }
        return b;
    },
    add: function(that) {
        return this.copy().addM(that);
    },
    sub: function(that) {
        return this.copy().subM(that);
    },
    mul: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var i, j, a = this.limbs, b = that.limbs, al = a.length, bl = b.length, out = new this._class(), c = out.limbs, ai, ii = this.maxMul;
        for (i = 0; i < this.limbs.length + that.limbs.length + 1; i++) {
            c[i] = 0;
        }
        for (i = 0; i < al; i++) {
            ai = a[i];
            for (j = 0; j < bl; j++) {
                c[i + j] += ai * b[j];
            }
            if (!--ii) {
                ii = this.maxMul;
                out.cnormalize();
            }
        }
        return out.cnormalize().reduce();
    },
    square: function() {
        return this.mul(this);
    },
    power: function(l) {
        if (typeof l === "number") {
            l = [ l ];
        } else if (l.limbs !== undefined) {
            l = l.normalize().limbs;
        }
        var i, j, out = new this._class(1), pow = this;
        for (i = 0; i < l.length; i++) {
            for (j = 0; j < this.radix; j++) {
                if (l[i] & 1 << j) {
                    out = out.mul(pow);
                }
                pow = pow.square();
            }
        }
        return out;
    },
    mulmod: function(that, N) {
        return this.mod(N).mul(that.mod(N)).mod(N);
    },
    powermod: function(x, N) {
        var result = new sjcl.bn(1), a = new sjcl.bn(this), k = new sjcl.bn(x);
        while (true) {
            if (k.limbs[0] & 1) {
                result = result.mulmod(a, N);
            }
            k.halveM();
            if (k.equals(0)) {
                break;
            }
            a = a.mulmod(a, N);
        }
        return result.normalize().reduce();
    },
    trim: function() {
        var l = this.limbs, p;
        do {
            p = l.pop();
        } while (l.length && p === 0);
        l.push(p);
        return this;
    },
    reduce: function() {
        return this;
    },
    fullReduce: function() {
        return this.normalize();
    },
    normalize: function() {
        var carry = 0, i, pv = this.placeVal, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
        for (i = 0; i < ll || carry !== 0 && carry !== -1; i++) {
            l = (limbs[i] || 0) + carry;
            m = limbs[i] = l & mask;
            carry = (l - m) * ipv;
        }
        if (carry === -1) {
            limbs[i - 1] -= this.placeVal;
        }
        return this;
    },
    cnormalize: function() {
        var carry = 0, i, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
        for (i = 0; i < ll - 1; i++) {
            l = limbs[i] + carry;
            m = limbs[i] = l & mask;
            carry = (l - m) * ipv;
        }
        limbs[i] += carry;
        return this;
    },
    toBits: function(len) {
        this.fullReduce();
        len = len || this.exponent || this.bitLength();
        var i = Math.floor((len - 1) / 24), w = sjcl.bitArray, e = (len + 7 & -8) % this.radix || this.radix, out = [ w.partial(e, this.getLimb(i)) ];
        for (i--; i >= 0; i--) {
            out = w.concat(out, [ w.partial(Math.min(this.radix, len), this.getLimb(i)) ]);
            len -= this.radix;
        }
        return out;
    },
    bitLength: function() {
        this.fullReduce();
        var out = this.radix * (this.limbs.length - 1), b = this.limbs[this.limbs.length - 1];
        for (;b; b >>>= 1) {
            out++;
        }
        return out + 7 & -8;
    }
};

sjcl.bn.fromBits = function(bits) {
    var Class = this, out = new Class(), words = [], w = sjcl.bitArray, t = this.prototype, l = Math.min(this.bitLength || 4294967296, w.bitLength(bits)), e = l % t.radix || t.radix;
    words[0] = w.extract(bits, 0, e);
    for (;e < l; e += t.radix) {
        words.unshift(w.extract(bits, e, t.radix));
    }
    out.limbs = words;
    return out;
};

sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2, sjcl.bn.prototype.radix));

sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1;

sjcl.bn.pseudoMersennePrime = function(exponent, coeff) {
    function p(it) {
        this.initWith(it);
    }
    var ppr = p.prototype = new sjcl.bn(), i, tmp, mo;
    mo = ppr.modOffset = Math.ceil(tmp = exponent / ppr.radix);
    ppr.exponent = exponent;
    ppr.offset = [];
    ppr.factor = [];
    ppr.minOffset = mo;
    ppr.fullMask = 0;
    ppr.fullOffset = [];
    ppr.fullFactor = [];
    ppr.modulus = p.modulus = new sjcl.bn(Math.pow(2, exponent));
    ppr.fullMask = 0 | -Math.pow(2, exponent % ppr.radix);
    for (i = 0; i < coeff.length; i++) {
        ppr.offset[i] = Math.floor(coeff[i][0] / ppr.radix - tmp);
        ppr.fullOffset[i] = Math.ceil(coeff[i][0] / ppr.radix - tmp);
        ppr.factor[i] = coeff[i][1] * Math.pow(1 / 2, exponent - coeff[i][0] + ppr.offset[i] * ppr.radix);
        ppr.fullFactor[i] = coeff[i][1] * Math.pow(1 / 2, exponent - coeff[i][0] + ppr.fullOffset[i] * ppr.radix);
        ppr.modulus.addM(new sjcl.bn(Math.pow(2, coeff[i][0]) * coeff[i][1]));
        ppr.minOffset = Math.min(ppr.minOffset, -ppr.offset[i]);
    }
    ppr._class = p;
    ppr.modulus.cnormalize();
    ppr.reduce = function() {
        var i, k, l, mo = this.modOffset, limbs = this.limbs, aff, off = this.offset, ol = this.offset.length, fac = this.factor, ll;
        i = this.minOffset;
        while (limbs.length > mo) {
            l = limbs.pop();
            ll = limbs.length;
            for (k = 0; k < ol; k++) {
                limbs[ll + off[k]] -= fac[k] * l;
            }
            i--;
            if (!i) {
                limbs.push(0);
                this.cnormalize();
                i = this.minOffset;
            }
        }
        this.cnormalize();
        return this;
    };
    ppr._strongReduce = ppr.fullMask === -1 ? ppr.reduce : function() {
        var limbs = this.limbs, i = limbs.length - 1, k, l;
        this.reduce();
        if (i === this.modOffset - 1) {
            l = limbs[i] & this.fullMask;
            limbs[i] -= l;
            for (k = 0; k < this.fullOffset.length; k++) {
                limbs[i + this.fullOffset[k]] -= this.fullFactor[k] * l;
            }
            this.normalize();
        }
    };
    ppr.fullReduce = function() {
        var greater, i;
        this._strongReduce();
        this.addM(this.modulus);
        this.addM(this.modulus);
        this.normalize();
        this._strongReduce();
        for (i = this.limbs.length; i < this.modOffset; i++) {
            this.limbs[i] = 0;
        }
        greater = this.greaterEquals(this.modulus);
        for (i = 0; i < this.limbs.length; i++) {
            this.limbs[i] -= this.modulus.limbs[i] * greater;
        }
        this.cnormalize();
        return this;
    };
    ppr.inverse = function() {
        return this.power(this.modulus.sub(2));
    };
    p.fromBits = sjcl.bn.fromBits;
    return p;
};

var sbp = sjcl.bn.pseudoMersennePrime;

sjcl.bn.prime = {
    p127: sbp(127, [ [ 0, -1 ] ]),
    p25519: sbp(255, [ [ 0, -19 ] ]),
    p192k: sbp(192, [ [ 32, -1 ], [ 12, -1 ], [ 8, -1 ], [ 7, -1 ], [ 6, -1 ], [ 3, -1 ], [ 0, -1 ] ]),
    p224k: sbp(224, [ [ 32, -1 ], [ 12, -1 ], [ 11, -1 ], [ 9, -1 ], [ 7, -1 ], [ 4, -1 ], [ 1, -1 ], [ 0, -1 ] ]),
    p256k: sbp(256, [ [ 32, -1 ], [ 9, -1 ], [ 8, -1 ], [ 7, -1 ], [ 6, -1 ], [ 4, -1 ], [ 0, -1 ] ]),
    p192: sbp(192, [ [ 0, -1 ], [ 64, -1 ] ]),
    p224: sbp(224, [ [ 0, 1 ], [ 96, -1 ] ]),
    p256: sbp(256, [ [ 0, -1 ], [ 96, 1 ], [ 192, 1 ], [ 224, -1 ] ]),
    p384: sbp(384, [ [ 0, -1 ], [ 32, 1 ], [ 96, -1 ], [ 128, -1 ] ]),
    p521: sbp(521, [ [ 0, -1 ] ])
};

sjcl.bn.random = function(modulus, paranoia) {
    if (typeof modulus !== "object") {
        modulus = new sjcl.bn(modulus);
    }
    var words, i, l = modulus.limbs.length, m = modulus.limbs[l - 1] + 1, out = new sjcl.bn();
    while (true) {
        do {
            words = sjcl.random.randomWords(l, paranoia);
            if (words[l - 1] < 0) {
                words[l - 1] += 4294967296;
            }
        } while (Math.floor(words[l - 1] / m) === Math.floor(4294967296 / m));
        words[l - 1] %= m;
        for (i = 0; i < l - 1; i++) {
            words[i] &= modulus.radixMask;
        }
        out.limbs = words;
        if (!out.greaterEquals(modulus)) {
            return out;
        }
    }
};

sjcl.ecc = {};

sjcl.ecc.point = function(curve, x, y) {
    if (x === undefined) {
        this.isIdentity = true;
    } else {
        this.x = x;
        this.y = y;
        this.isIdentity = false;
    }
    this.curve = curve;
};

sjcl.ecc.point.prototype = {
    toJac: function() {
        return new sjcl.ecc.pointJac(this.curve, this.x, this.y, new this.curve.field(1));
    },
    mult: function(k) {
        return this.toJac().mult(k, this).toAffine();
    },
    mult2: function(k, k2, affine2) {
        return this.toJac().mult2(k, this, k2, affine2).toAffine();
    },
    multiples: function() {
        var m, i, j;
        if (this._multiples === undefined) {
            j = this.toJac().doubl();
            m = this._multiples = [ new sjcl.ecc.point(this.curve), this, j.toAffine() ];
            for (i = 3; i < 16; i++) {
                j = j.add(this);
                m.push(j.toAffine());
            }
        }
        return this._multiples;
    },
    isValid: function() {
        return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))));
    },
    toBits: function() {
        return sjcl.bitArray.concat(this.x.toBits(), this.y.toBits());
    }
};

sjcl.ecc.pointJac = function(curve, x, y, z) {
    if (x === undefined) {
        this.isIdentity = true;
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
        this.isIdentity = false;
    }
    this.curve = curve;
};

sjcl.ecc.pointJac.prototype = {
    add: function(T) {
        var S = this, sz2, c, d, c2, x1, x2, x, y1, y2, y, z;
        if (S.curve !== T.curve) {
            throw "sjcl.ecc.add(): Points must be on the same curve to add them!";
        }
        if (S.isIdentity) {
            return T.toJac();
        } else if (T.isIdentity) {
            return S;
        }
        sz2 = S.z.square();
        c = T.x.mul(sz2).subM(S.x);
        if (c.equals(0)) {
            if (S.y.equals(T.y.mul(sz2.mul(S.z)))) {
                return S.doubl();
            } else {
                return new sjcl.ecc.pointJac(S.curve);
            }
        }
        d = T.y.mul(sz2.mul(S.z)).subM(S.y);
        c2 = c.square();
        x1 = d.square();
        x2 = c.square().mul(c).addM(S.x.add(S.x).mul(c2));
        x = x1.subM(x2);
        y1 = S.x.mul(c2).subM(x).mul(d);
        y2 = S.y.mul(c.square().mul(c));
        y = y1.subM(y2);
        z = S.z.mul(c);
        return new sjcl.ecc.pointJac(this.curve, x, y, z);
    },
    doubl: function() {
        if (this.isIdentity) {
            return this;
        }
        var y2 = this.y.square(), a = y2.mul(this.x.mul(4)), b = y2.square().mul(8), z2 = this.z.square(), c = this.curve.a.toString() == new sjcl.bn(-3).toString() ? this.x.sub(z2).mul(3).mul(this.x.add(z2)) : this.x.square().mul(3).add(z2.square().mul(this.curve.a)), x = c.square().subM(a).subM(a), y = a.sub(x).mul(c).subM(b), z = this.y.add(this.y).mul(this.z);
        return new sjcl.ecc.pointJac(this.curve, x, y, z);
    },
    toAffine: function() {
        if (this.isIdentity || this.z.equals(0)) {
            return new sjcl.ecc.point(this.curve);
        }
        var zi = this.z.inverse(), zi2 = zi.square();
        return new sjcl.ecc.point(this.curve, this.x.mul(zi2).fullReduce(), this.y.mul(zi2.mul(zi)).fullReduce());
    },
    mult: function(k, affine) {
        if (typeof k === "number") {
            k = [ k ];
        } else if (k.limbs !== undefined) {
            k = k.normalize().limbs;
        }
        var i, j, out = new sjcl.ecc.point(this.curve).toJac(), multiples = affine.multiples();
        for (i = k.length - 1; i >= 0; i--) {
            for (j = sjcl.bn.prototype.radix - 4; j >= 0; j -= 4) {
                out = out.doubl().doubl().doubl().doubl().add(multiples[k[i] >> j & 15]);
            }
        }
        return out;
    },
    mult2: function(k1, affine, k2, affine2) {
        if (typeof k1 === "number") {
            k1 = [ k1 ];
        } else if (k1.limbs !== undefined) {
            k1 = k1.normalize().limbs;
        }
        if (typeof k2 === "number") {
            k2 = [ k2 ];
        } else if (k2.limbs !== undefined) {
            k2 = k2.normalize().limbs;
        }
        var i, j, out = new sjcl.ecc.point(this.curve).toJac(), m1 = affine.multiples(), m2 = affine2.multiples(), l1, l2;
        for (i = Math.max(k1.length, k2.length) - 1; i >= 0; i--) {
            l1 = k1[i] | 0;
            l2 = k2[i] | 0;
            for (j = sjcl.bn.prototype.radix - 4; j >= 0; j -= 4) {
                out = out.doubl().doubl().doubl().doubl().add(m1[l1 >> j & 15]).add(m2[l2 >> j & 15]);
            }
        }
        return out;
    },
    isValid: function() {
        var z2 = this.z.square(), z4 = z2.square(), z6 = z4.mul(z2);
        return this.y.square().equals(this.curve.b.mul(z6).add(this.x.mul(this.curve.a.mul(z4).add(this.x.square()))));
    }
};

sjcl.ecc.curve = function(Field, r, a, b, x, y) {
    this.field = Field;
    this.r = new sjcl.bn(r);
    this.a = new Field(a);
    this.b = new Field(b);
    this.G = new sjcl.ecc.point(this, new Field(x), new Field(y));
};

sjcl.ecc.curve.prototype.fromBits = function(bits) {
    var w = sjcl.bitArray, l = this.field.prototype.exponent + 7 & -8, p = new sjcl.ecc.point(this, this.field.fromBits(w.bitSlice(bits, 0, l)), this.field.fromBits(w.bitSlice(bits, l, 2 * l)));
    if (!p.isValid()) {
        throw new sjcl.exception.corrupt("not on the curve!");
    }
    return p;
};

sjcl.ecc.curves = {
    c192: new sjcl.ecc.curve(sjcl.bn.prime.p192, "0xffffffffffffffffffffffff99def836146bc9b1b4d22831", -3, "0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1", "0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012", "0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),
    c224: new sjcl.ecc.curve(sjcl.bn.prime.p224, "0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d", -3, "0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4", "0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21", "0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),
    c256: new sjcl.ecc.curve(sjcl.bn.prime.p256, "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", -3, "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
    c384: new sjcl.ecc.curve(sjcl.bn.prime.p384, "0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973", -3, "0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef", "0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7", "0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
    k192: new sjcl.ecc.curve(sjcl.bn.prime.p192k, "0xfffffffffffffffffffffffe26f2fc170f69466a74defd8d", 0, 3, "0xdb4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d", "0x9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"),
    k224: new sjcl.ecc.curve(sjcl.bn.prime.p224k, "0x010000000000000000000000000001dce8d2ec6184caf0a971769fb1f7", 0, 5, "0xa1455b334df099df30fc28a169a467e9e47075a90f7e650eb6b7a45c", "0x7e089fed7fba344282cafbd6f7e319f7c0b0bd59e2ca4bdb556d61a5"),
    k256: new sjcl.ecc.curve(sjcl.bn.prime.p256k, "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 0, 7, "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};

sjcl.ecc.basicKey = {
    publicKey: function(curve, point) {
        this._curve = curve;
        this._curveBitLength = curve.r.bitLength();
        if (point instanceof Array) {
            this._point = curve.fromBits(point);
        } else {
            this._point = point;
        }
        this.get = function() {
            var pointbits = this._point.toBits();
            var len = sjcl.bitArray.bitLength(pointbits);
            var x = sjcl.bitArray.bitSlice(pointbits, 0, len / 2);
            var y = sjcl.bitArray.bitSlice(pointbits, len / 2);
            return {
                x: x,
                y: y
            };
        };
    },
    secretKey: function(curve, exponent) {
        this._curve = curve;
        this._curveBitLength = curve.r.bitLength();
        this._exponent = exponent;
        this.get = function() {
            return this._exponent.toBits();
        };
    }
};

sjcl.ecc.basicKey.generateKeys = function(cn) {
    return function generateKeys(curve, paranoia, sec) {
        curve = curve || 256;
        if (typeof curve === "number") {
            curve = sjcl.ecc.curves["c" + curve];
            if (curve === undefined) {
                throw new sjcl.exception.invalid("no such curve");
            }
        }
        sec = sec || sjcl.bn.random(curve.r, paranoia);
        var pub = curve.G.mult(sec);
        return {
            pub: new sjcl.ecc[cn].publicKey(curve, pub),
            sec: new sjcl.ecc[cn].secretKey(curve, sec)
        };
    };
};

sjcl.ecc.elGamal = {
    generateKeys: sjcl.ecc.basicKey.generateKeys("elGamal"),
    publicKey: function(curve, point) {
        sjcl.ecc.basicKey.publicKey.apply(this, arguments);
    },
    secretKey: function(curve, exponent) {
        sjcl.ecc.basicKey.secretKey.apply(this, arguments);
    }
};

sjcl.ecc.elGamal.publicKey.prototype = {
    kem: function(paranoia) {
        var sec = sjcl.bn.random(this._curve.r, paranoia), tag = this._curve.G.mult(sec).toBits(), key = sjcl.hash.sha256.hash(this._point.mult(sec).toBits());
        return {
            key: key,
            tag: tag
        };
    }
};

sjcl.ecc.elGamal.secretKey.prototype = {
    unkem: function(tag) {
        return sjcl.hash.sha256.hash(this._curve.fromBits(tag).mult(this._exponent).toBits());
    },
    dh: function(pk) {
        return sjcl.hash.sha256.hash(pk._point.mult(this._exponent).toBits());
    }
};

sjcl.ecc.ecdsa = {
    generateKeys: sjcl.ecc.basicKey.generateKeys("ecdsa")
};

sjcl.ecc.ecdsa.publicKey = function(curve, point) {
    sjcl.ecc.basicKey.publicKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.publicKey.prototype = {
    verify: function(hash, rs, fakeLegacyVersion) {
        if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
            hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
        }
        var w = sjcl.bitArray, R = this._curve.r, l = this._curveBitLength, r = sjcl.bn.fromBits(w.bitSlice(rs, 0, l)), ss = sjcl.bn.fromBits(w.bitSlice(rs, l, 2 * l)), s = fakeLegacyVersion ? ss : ss.inverseMod(R), hG = sjcl.bn.fromBits(hash).mul(s).mod(R), hA = r.mul(s).mod(R), r2 = this._curve.G.mult2(hG, hA, this._point).x;
        if (r.equals(0) || ss.equals(0) || r.greaterEquals(R) || ss.greaterEquals(R) || !r2.equals(r)) {
            if (fakeLegacyVersion === undefined) {
                return this.verify(hash, rs, true);
            } else {
                throw new sjcl.exception.corrupt("signature didn't check out");
            }
        }
        return true;
    }
};

sjcl.ecc.ecdsa.secretKey = function(curve, exponent) {
    sjcl.ecc.basicKey.secretKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.secretKey.prototype = {
    sign: function(hash, paranoia, fakeLegacyVersion, fixedKForTesting) {
        if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
            hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
        }
        var R = this._curve.r, l = R.bitLength(), k = fixedKForTesting || sjcl.bn.random(R.sub(1), paranoia).add(1), r = this._curve.G.mult(k).x.mod(R), ss = sjcl.bn.fromBits(hash).add(r.mul(this._exponent)), s = fakeLegacyVersion ? ss.inverseMod(R).mul(k).mod(R) : ss.mul(k.inverseMod(R)).mod(R);
        return sjcl.bitArray.concat(r.toBits(l), s.toBits(l));
    }
};

sjcl.keyexchange.srp = {
    makeVerifier: function(I, P, s, group) {
        var x;
        x = sjcl.keyexchange.srp.makeX(I, P, s);
        x = sjcl.bn.fromBits(x);
        return group.g.powermod(x, group.N);
    },
    makeX: function(I, P, s) {
        var inner = sjcl.hash.sha1.hash(I + ":" + P);
        return sjcl.hash.sha1.hash(sjcl.bitArray.concat(s, inner));
    },
    knownGroup: function(i) {
        if (typeof i !== "string") {
            i = i.toString();
        }
        if (!sjcl.keyexchange.srp._didInitKnownGroups) {
            sjcl.keyexchange.srp._initKnownGroups();
        }
        return sjcl.keyexchange.srp._knownGroups[i];
    },
    _didInitKnownGroups: false,
    _initKnownGroups: function() {
        var i, size, group;
        for (i = 0; i < sjcl.keyexchange.srp._knownGroupSizes.length; i++) {
            size = sjcl.keyexchange.srp._knownGroupSizes[i].toString();
            group = sjcl.keyexchange.srp._knownGroups[size];
            group.N = new sjcl.bn(group.N);
            group.g = new sjcl.bn(group.g);
        }
        sjcl.keyexchange.srp._didInitKnownGroups = true;
    },
    _knownGroupSizes: [ 1024, 1536, 2048 ],
    _knownGroups: {
        1024: {
            N: "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C" + "9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE4" + "8E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B29" + "7BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9A" + "FD5138FE8376435B9FC61D2FC0EB06E3",
            g: 2
        },
        1536: {
            N: "9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA961" + "4B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F843" + "80B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0B" + "E3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF5" + "6EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734A" + "F7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E" + "8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB",
            g: 2
        },
        2048: {
            N: "AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC319294" + "3DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310D" + "CD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FB" + "D5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF74" + "7359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A" + "436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D" + "5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E73" + "03CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB6" + "94B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F" + "9E4AFF73",
            g: 2
        }
    }
};

"use strict";

sjcl.misc.hkdf = {
    extract: function(key, message) {
        return sjcl.codec.hex.fromBits(new sjcl.misc.hmac(sjcl.codec.bytes.toBits(key), sjcl.hash.sha256).encrypt(sjcl.codec.bytes.toBits(message)));
    },
    expand: function(prk, info, l) {
        if (typeof prk === "string") {
            prk = sjcl.codec.bytes.fromBits(sjcl.codec.utf8String.toBits(prk));
        }
        if (typeof info === "string") {
            info = sjcl.codec.bytes.fromBits(sjcl.codec.utf8String.toBits(info));
        }
        var hashlen = 32;
        l = l || hashlen;
        var output = [];
        var n = Math.ceil(l / hashlen);
        var ti = [];
        for (var i = 1; i <= n; i++) {
            ti = sjcl.codec.bytes.fromBits(new sjcl.misc.hmac(sjcl.codec.bytes.toBits(prk), sjcl.hash.sha256).encrypt(sjcl.codec.bytes.toBits(ti.concat(info).concat(i))));
            output = output.concat(ti);
        }
        if (output.length > l) {
            output = output.slice(0, l);
        }
        return sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(output));
    }
};

"use strict";

(function() {
    sjcl.hash.ripemd160 = function(hash) {
        if (hash) {
            this._h = hash._h.slice(0);
            this._buffer = hash._buffer.slice(0);
            this._length = hash._length;
        } else {
            this.reset();
        }
    };
    sjcl.hash.ripemd160.hash = function(data) {
        return new sjcl.hash.ripemd160().update(data).finalize();
    };
    sjcl.hash.ripemd160.prototype = {
        reset: function() {
            this._h = _h0.slice(0);
            this._buffer = [];
            this._length = 0;
            return this;
        },
        update: function(data) {
            if (typeof data === "string") data = sjcl.codec.utf8String.toBits(data);
            var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
            for (i = 512 + ol & -512; i <= nl; i += 512) {
                var words = b.splice(0, 16);
                for (var w = 0; w < 16; ++w) words[w] = _cvt(words[w]);
                _block.call(this, words);
            }
            return this;
        },
        finalize: function() {
            var b = sjcl.bitArray.concat(this._buffer, [ sjcl.bitArray.partial(1, 1) ]), l = (this._length + 1) % 512, z = (l > 448 ? 512 : 448) - l % 448, zp = z % 32;
            if (zp > 0) b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(zp, 0) ]);
            for (;z >= 32; z -= 32) b.push(0);
            b.push(_cvt(this._length | 0));
            b.push(_cvt(Math.floor(this._length / 4294967296)));
            while (b.length) {
                var words = b.splice(0, 16);
                for (var w = 0; w < 16; ++w) words[w] = _cvt(words[w]);
                _block.call(this, words);
            }
            var h = this._h;
            this.reset();
            for (var w = 0; w < 5; ++w) h[w] = _cvt(h[w]);
            return h;
        }
    };
    var _h0 = [ 1732584193, 4023233417, 2562383102, 271733878, 3285377520 ];
    var _k1 = [ 0, 1518500249, 1859775393, 2400959708, 2840853838 ];
    var _k2 = [ 1352829926, 1548603684, 1836072691, 2053994217, 0 ];
    for (var i = 4; i >= 0; --i) {
        for (var j = 1; j < 16; ++j) {
            _k1.splice(i, 0, _k1[i]);
            _k2.splice(i, 0, _k2[i]);
        }
    }
    var _r1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13 ];
    var _r2 = [ 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11 ];
    var _s1 = [ 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6 ];
    var _s2 = [ 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11 ];
    function _f0(x, y, z) {
        return x ^ y ^ z;
    }
    function _f1(x, y, z) {
        return x & y | ~x & z;
    }
    function _f2(x, y, z) {
        return (x | ~y) ^ z;
    }
    function _f3(x, y, z) {
        return x & z | y & ~z;
    }
    function _f4(x, y, z) {
        return x ^ (y | ~z);
    }
    function _rol(n, l) {
        return n << l | n >>> 32 - l;
    }
    function _cvt(n) {
        return (n & 255 << 0) << 24 | (n & 255 << 8) << 8 | (n & 255 << 16) >>> 8 | (n & 255 << 24) >>> 24;
    }
    function _block(X) {
        var A1 = this._h[0], B1 = this._h[1], C1 = this._h[2], D1 = this._h[3], E1 = this._h[4], A2 = this._h[0], B2 = this._h[1], C2 = this._h[2], D2 = this._h[3], E2 = this._h[4];
        var j = 0, T;
        for (;j < 16; ++j) {
            T = _rol(A1 + _f0(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
            A1 = E1;
            E1 = D1;
            D1 = _rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = _rol(A2 + _f4(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
            A2 = E2;
            E2 = D2;
            D2 = _rol(C2, 10);
            C2 = B2;
            B2 = T;
        }
        for (;j < 32; ++j) {
            T = _rol(A1 + _f1(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
            A1 = E1;
            E1 = D1;
            D1 = _rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = _rol(A2 + _f3(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
            A2 = E2;
            E2 = D2;
            D2 = _rol(C2, 10);
            C2 = B2;
            B2 = T;
        }
        for (;j < 48; ++j) {
            T = _rol(A1 + _f2(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
            A1 = E1;
            E1 = D1;
            D1 = _rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = _rol(A2 + _f2(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
            A2 = E2;
            E2 = D2;
            D2 = _rol(C2, 10);
            C2 = B2;
            B2 = T;
        }
        for (;j < 64; ++j) {
            T = _rol(A1 + _f3(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
            A1 = E1;
            E1 = D1;
            D1 = _rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = _rol(A2 + _f1(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
            A2 = E2;
            E2 = D2;
            D2 = _rol(C2, 10);
            C2 = B2;
            B2 = T;
        }
        for (;j < 80; ++j) {
            T = _rol(A1 + _f4(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
            A1 = E1;
            E1 = D1;
            D1 = _rol(C1, 10);
            C1 = B1;
            B1 = T;
            T = _rol(A2 + _f0(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
            A2 = E2;
            E2 = D2;
            D2 = _rol(C2, 10);
            C2 = B2;
            B2 = T;
        }
        T = this._h[1] + C1 + D2;
        this._h[1] = this._h[2] + D1 + E2;
        this._h[2] = this._h[3] + E1 + A2;
        this._h[3] = this._h[4] + A1 + B2;
        this._h[4] = this._h[0] + B1 + C2;
        this._h[0] = T;
    }
})();

"use strict";

var bitcoin = {
    Address: {},
    util: {},
    base58: {},
    ECKey: {},
    HDKey: {},
    HDMasterKey: {},
    WalletCredentials: {},
    Transaction: {},
    mnemonic: {}
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = bitcoin;
}

"use strict";

bitcoin.Address = {};

(function() {
    function sha256sha256(message) {
        var hash = sjcl.codec.bytes.toBits(message);
        return sjcl.codec.bytes.fromBits(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(hash)));
    }
    var Address = bitcoin.Address = function(hash, version) {
        if ("string" == typeof hash) {
            this.decodeString(hash);
            return;
        }
        this.hash = hash;
        this.version = version || Address.versions.bitcoin.production.pubKey;
    };
    Address.prototype.toString = function() {
        var hash = this.hash.slice(0);
        hash.unshift(this.version);
        var checksum = sha256sha256(hash);
        return bitcoin.base58.encode(hash.concat(checksum.slice(0, 4)));
    };
    Address.prototype.decodeString = function(string) {
        var bytes = bitcoin.base58.decode(string);
        var hash = bytes.slice(0, 21);
        var checksum = sha256sha256(hash);
        if (checksum[0] != bytes[21] || checksum[1] != bytes[22] || checksum[2] != bytes[23] || checksum[3] != bytes[24]) {
            throw "Checksum validation failed!";
        }
        var version = hash.shift();
        var versionInfo = Address.versionsReversed[version];
        if (!versionInfo) {
            throw "Version " + version + " not supported!";
        }
        this.hash = hash;
        this.version = version;
    };
    Address.prototype.isP2SH = function() {
        var versionInfo = Address.versionsReversed[this.version];
        return versionInfo.type == "p2sh";
    };
    Address.prototype.isPubKey = function() {
        var versionInfo = Address.versionsReversed[this.version];
        return versionInfo.type == "pubKey";
    };
    Address.isValid = function(address) {
        var bytes = bitcoin.base58.decode(address);
        var hash = bytes.slice(0, 21);
        var checksum = sha256sha256(hash);
        if (checksum[0] != bytes[21] || checksum[1] != bytes[22] || checksum[2] != bytes[23] || checksum[3] != bytes[24]) {
            return false;
        }
        return true;
    };
    Address.versions = {
        bitcoin: {
            testnet: {
                p2sh: 196,
                pubKey: 111
            },
            production: {
                p2sh: 5,
                pubKey: 0
            }
        }
    };
    Address.versionsReversed = [];
    for (var currency in Address.versions) {
        var networks = Address.versions[currency];
        for (var network in networks) {
            var keys = Address.versions[currency][network];
            for (var key in keys) {
                var keyValue = Address.versions[currency][network][key];
                Address.versionsReversed[keyValue] = {
                    currency: currency,
                    network: network,
                    type: key
                };
            }
        }
    }
})();

"use strict";

bitcoin.base58 = {};

(function() {
    function toByteArrayUnsigned(bn) {
        var ba = bn.abs().toByteArray();
        if (!ba.length) {
            return ba;
        }
        if (ba[0] === 0) {
            ba = ba.slice(1);
        }
        for (var i = 0; i < ba.length; ++i) {
            ba[i] = ba[i] < 0 ? ba[i] + 256 : ba[i];
        }
        return ba;
    }
    function fromByteArrayUnsigned(ba) {
        if (!ba.length) {
            return new BigInteger(0);
        } else if (ba[0] & 128) {
            return new BigInteger([ 0 ].concat(ba));
        } else {
            return new BigInteger(ba);
        }
    }
    var alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var base = new BigInteger(null);
    base.fromInt(58);
    var positions = {};
    for (var i = 0; i < alphabet.length; ++i) {
        positions[alphabet[i]] = i;
    }
    var base58 = bitcoin.base58;
    base58.encode = function(input) {
        var bi = fromByteArrayUnsigned(input);
        var chars = [];
        while (bi.compareTo(base) >= 0) {
            var mod = bi.mod(base);
            chars.push(alphabet[mod.intValue()]);
            bi = bi.subtract(mod).divide(base);
        }
        chars.push(alphabet[bi.intValue()]);
        for (var i = 0; i < input.length; i++) {
            if (input[i] === 0) {
                chars.push(alphabet[0]);
            } else {
                break;
            }
        }
        return chars.reverse().join("");
    };
    base58.decode = function(input) {
        var base = new BigInteger(null);
        base.fromInt(58);
        var length = input.length;
        var num = BigInteger.ZERO;
        var leadingZero = 0;
        var seenOther = false;
        for (var i = 0; i < length; ++i) {
            var alphChar = input[i];
            var p = positions[alphChar];
            if (p === undefined) {
                throw new Error("invalid base58 string: " + input);
            }
            var pNum = new BigInteger(null);
            pNum.fromInt(p);
            num = num.multiply(base).add(pNum);
            if (alphChar === "1" && !seenOther) {
                ++leadingZero;
            } else {
                seenOther = true;
            }
        }
        var bytes = toByteArrayUnsigned(num);
        while (leadingZero-- > 0) {
            bytes.unshift(0);
        }
        return bytes;
    };
})();

"use strict";

bitcoin.config = {};

(function() {
    var config = bitcoin.config = {
        versions: {
            bitcoin: {
                testnet: {
                    xpubKey: "0x043587CF",
                    xprvKey: "0x04358394",
                    p2sh: 196,
                    pubKey: 111
                },
                production: {
                    xpubKey: "0x0488B21E",
                    xprvKey: "0x0488ADE4",
                    p2sh: 5,
                    pubKey: 0
                }
            }
        }
    };
    config.versionsReversed = {};
    for (var currency in config.versions) {
        var networks = config.versions[currency];
        for (var network in networks) {
            var keys = config.versions[currency][network];
            for (var key in keys) {
                var keyValue = config.versions[currency][network][key];
                config.versionsReversed[keyValue] = {
                    currency: currency,
                    network: network,
                    isPrivate: key == "private"
                };
            }
        }
    }
})();

"use strict";

bitcoin.ECKey = {};

(function() {
    var _0x00 = sjcl.codec.bytes.toBits([ 0 ]);
    var _0x02 = sjcl.codec.bytes.toBits([ 2 ]);
    var _0x03 = sjcl.codec.bytes.toBits([ 3 ]);
    var _0x04 = sjcl.codec.bytes.toBits([ 4 ]);
    var Q = "3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c";
    var ECKey = bitcoin.ECKey = function(prv, opts) {
        this._curve = sjcl.ecc.curves.k256;
        if (prv) {
            this.keyPair = sjcl.ecc.ecdsa.generateKeys(this._curve, 0, sjcl.bn.fromBits(prv));
            this.prv = this.keyPair.sec.get();
        }
    };
    ECKey.prototype._decompressY = function(odd_even, x) {
        var ySquared = this._curve.b.add(x.mul(this._curve.a.add(x.square())));
        var q = sjcl.bn.fromBits(sjcl.codec.hex.toBits(Q));
        var y = ySquared.powermod(q, this._curve.field.modulus);
        if (y.mod(2).equals(0) !== sjcl.bitArray.equal(odd_even, _0x02)) {
            y = this._curve.field.modulus.sub(y);
        }
        return sjcl.ecc.curves.k256.fromBits(new sjcl.ecc.point(this._curve, x, y).toBits());
    };
    ECKey.prototype._pubToECPoint = function(key) {
        var xBits = sjcl.bitArray.concat(_0x00, sjcl.bitArray.bitSlice(key, 8, 256 + 8));
        var yBits = sjcl.bitArray.concat(_0x00, sjcl.bitArray.bitSlice(key, 256 + 8));
        var x = sjcl.bn.fromBits(xBits);
        var y = sjcl.bn.fromBits(yBits);
        if (y.equals(0) && this._curve.field.modulus.mod(new sjcl.bn(4)).equals(new sjcl.bn(3))) {
            return this._decompressY(sjcl.bitArray.bitSlice(key, 0, 8), x);
        }
        return new sjcl.ecc.point(this._curve, x, y);
    };
    ECKey.prototype._encodePubKey = function(point, compressed) {
        var enc = point.x.toBits();
        var y = point.y.toBits();
        var yIsEven = sjcl.bn.fromBits(y).mod(2).equals(0);
        if (compressed) {
            if (yIsEven) {
                enc = sjcl.bitArray.concat(_0x02, enc);
            } else {
                enc = sjcl.bitArray.concat(_0x03, enc);
            }
        } else {
            enc = sjcl.bitArray.concat(_0x04, enc);
            enc = sjcl.bitArray.concat(enc, y);
        }
        return enc;
    };
    ECKey.prototype.setCompressed = function(compressed) {
        this.pubKeyHash = undefined;
        this.compressed = !!compressed;
    };
    ECKey.prototype.setPub = function(pub) {
        this.pub = this._pubToECPoint(pub);
    };
    ECKey.prototype.getPubPoint = function() {
        if (this.pub) {
            return this.pub;
        }
        this.pub = this._curve.G.mult(sjcl.bn.fromBits(this.prv));
        return this.pub;
    };
    ECKey.prototype.getPub = function() {
        return this._encodePubKey(this.getPubPoint(), this.compressed);
    };
    ECKey.prototype.isValidPub = function() {
        var point = sjcl.ecc.curves.k256.fromBits(this.getPubPoint().toBits());
        return point.isValid();
    };
    ECKey.prototype.getPubKeyHash = function() {
        if (this.pubKeyHash) return this.pubKeyHash;
        return this.pubKeyHash = bitcoin.util.sha256ripe160(this.getPub());
    };
    ECKey.prototype.getBitcoinAddress = function() {
        return new bitcoin.Address(sjcl.codec.bytes.fromBits(this.getPubKeyHash()));
    };
    ECKey.prototype.sign = function(hash) {
        if (!this.keyPair) {
            throw new Error("Cannot perform a sign without a private key");
        }
        return this.keyPair.sec.signDER(hash);
    };
    ECKey.prototype.verify = function(hash, signature) {
        return keyPair.pub.verify(hash, signature);
    };
})();

bitcoin.ExtendedKey = {};

(function() {
    var ExtendedKey = bitcoin.ExtendedKey = function(xKey) {
        this.deserialize(xKey);
        if (!this.isValid()) throw "checksum failed.";
    };
    ExtendedKey.prototype.isValid = function() {
        return sjcl.bitArray.equal(sjcl.bitArray.bitSlice(this.keyHash, 0, 32), this.checksum);
    };
    ExtendedKey.prototype.deserialize = function(xKey) {
        var xPubBytes = bitcoin.base58.decode(xKey);
        var keyBytes = xPubBytes.slice(0, 78);
        this.key = sjcl.codec.bytes.toBits(keyBytes);
        this.checksum = sjcl.codec.bytes.toBits(xPubBytes.slice(78, 82));
        this.keyHash = sjcl.codec.bytes.toBits(bitcoin.util.sha256sha256(keyBytes));
    };
    ExtendedKey.isValid = function(xKey) {
        var xPubBytes = bitcoin.base58.decode(xKey);
        var keyBytes = xPubBytes.slice(0, 78);
        var checksumBytes = xPubBytes.slice(78, 82);
        var keyHash = bitcoin.util.sha256sha256(keyBytes);
        return keyHash[0] === checksumBytes[0] && keyHash[1] === checksumBytes[1] && keyHash[2] === checksumBytes[2] && keyHash[3] === checksumBytes[3];
    };
})();

"use strict";

bitcoin.HDKey = {};

(function() {
    var HDKey = bitcoin.HDKey = function(opts) {
        if (opts && opts.chain && sjcl.bitArray.bitLength(opts.chain) != 256) throw new Error("invalid chain code");
        if (!opts.pub && !opts.prv) throw new Error("no keys defined");
        this.chain = opts.chain;
        this._hmacChain = new sjcl.misc.hmac(this.chain, sjcl.hash.sha512);
        this.version = opts.version || bitcoin.config.versions.bitcoin.production;
        if (opts.prv) {
            this.prv = opts.prv;
        }
        this.ecKey = new bitcoin.ECKey(this.prv, {
            version: bitcoin.config.versionsReversed[this.version["xpubKey"]]
        });
        this.ecKey.setCompressed(opts.compressed != undefined ? opts.compressed : true);
        if (opts.pub) {
            this.ecKey.setPub(opts.pub);
        }
        this.pub = this.ecKey.getPub();
        this.id = this.ecKey.getPubKeyHash();
        this.address = this.ecKey.getBitcoinAddress().toString();
        this.fpr = sjcl.bitArray.bitSlice(this.id, 0, 32);
        this.depth = opts.depth || 0;
        this.parent = opts.parent || sjcl.codec.bytes.toBits([ 0, 0, 0, 0 ]);
        this.child = opts.child || 0;
    };
    HDKey.prototype.setCompressedAddresses = function(compressed) {
        this.ecKey.setCompressed(compressed);
        this.id = this.ecKey.getPubKeyHash();
        this.address = this.ecKey.getBitcoinAddress().toString();
        this.fpr = sjcl.bitArray.bitSlice(this.id, 0, 32);
    };
    HDKey.prototype.derivePrivate = function(i) {
        if (!this.prv) {
            throw new Error("Cannot perform private derivation without a private key");
        }
        var I;
        var ib = bitcoin.util.intToBits(i);
        var kpar = sjcl.bn.fromBits(this.prv);
        if (i >= 2147483648) {
            I = this._hmacChain.encrypt(sjcl.bitArray.concat(sjcl.codec.bytes.toBits([ 0 ]), sjcl.bitArray.concat(this.prv, ib)));
        } else {
            var point = this.ecKey._curve.G.mult(kpar);
            var enc = sjcl.bitArray.concat(this.ecKey._encodePubKey(point, true), ib);
            I = this._hmacChain.encrypt(enc);
        }
        var IL = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(I, 0, 256));
        var IR = sjcl.bitArray.bitSlice(I, 256);
        var ki = IL.add(kpar).mod(this.ecKey._curve.r);
        var c = IL.greaterEquals(this.ecKey._curve.r);
        if (c > 0) return;
        if (ki.equals(0)) return;
        return new bitcoin.HDKey({
            prv: ki.toBits(),
            chain: IR,
            depth: this.depth + 1,
            parent: this.fpr,
            child: i
        });
    };
    HDKey.prototype.derivePublic = function(i) {
        if (i >= 2147483648) {
            throw new Error("Cannot perform private derivation using the public child key derivation function");
        }
        var ib = bitcoin.util.intToBits(i);
        var point = this.ecKey.getPubPoint();
        var I = this._hmacChain.encrypt(sjcl.bitArray.concat(this.pub, ib));
        var IL = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(I, 0, 256));
        var IR = sjcl.bitArray.bitSlice(I, 256);
        var ILMult = this.ecKey._curve.G.mult(IL);
        var Ki = new sjcl.ecc.point(this.ecKey._curve, point.toJac().add(ILMult).toAffine().x, ILMult.toJac().add(point).toAffine().y);
        var c = IL.greaterEquals(this.ecKey._curve.r);
        if (c > 0) return;
        return new bitcoin.HDKey({
            pub: this.ecKey._encodePubKey(Ki),
            chain: IR,
            depth: this.depth + 1,
            parent: this.fpr,
            child: i
        });
    };
    HDKey.prototype.serialize = function() {
        var serialized = {};
        var pub = this._serializePublicKey();
        var pubChecksum = bitcoin.util.sha256sha256(pub);
        serialized.pub = {
            hex: sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(pub)),
            b58: bitcoin.base58.encode(pub.concat(pubChecksum.slice(0, 4)))
        };
        if (this.prv) {
            var prv = this._serializePrivateKey();
            var prvChecksum = bitcoin.util.sha256sha256(prv);
            serialized.prv = {
                hex: sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(prv)),
                b58: bitcoin.base58.encode(prv.concat(prvChecksum.slice(0, 4)))
            };
        }
        return serialized;
    };
    HDKey.prototype._serializePublicKey = function() {
        var pub = sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.version["xpubKey"])).concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.depth))[3]).concat(sjcl.codec.bytes.fromBits(this.parent)).concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.child))).concat(sjcl.codec.bytes.fromBits(this.chain)).concat(sjcl.codec.bytes.fromBits(this.pub));
        return pub;
    };
    HDKey.deserializeKey = function(extKey) {
        if (extKey instanceof bitcoin.ExtendedKey) {
            extKey = extKey.key;
        }
        if (sjcl.bitArray.bitLength(extKey) != 624) {
            throw new Error("Not enough data");
        }
        var keyVersion = sjcl.bitArray.bitSlice(extKey, 0, 32);
        var version = "0x" + sjcl.codec.hex.fromBits(keyVersion).toString().toUpperCase();
        var versionInfo = bitcoin.config.versionsReversed[version];
        if (!versionInfo) {
            throw new Error("No version found. Invalid Key");
        }
        var opts = {
            version: bitcoin.config.versions[versionInfo.currency][versionInfo.network],
            depth: parseInt(sjcl.codec.hex.fromBits(sjcl.bitArray.bitSlice(extKey, 32, 40))),
            parent: sjcl.bitArray.bitSlice(extKey, 40, 72),
            child: parseInt(sjcl.codec.hex.fromBits(sjcl.bitArray.bitSlice(extKey, 72, 104))),
            chain: sjcl.bitArray.bitSlice(extKey, 104, 360)
        };
        opts[versionInfo.isPrivate ? "prv" : "pub"] = sjcl.bitArray.bitSlice(extKey, 360, 624);
        return new HDKey(opts);
    };
    HDKey.prototype._serializePrivateKey = function() {
        if (!this.prv) {
            throw new Error("Cannot serialize private key without a private key");
        }
        var prv = sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.version["xprvKey"])).concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.depth))[3]).concat(sjcl.codec.bytes.fromBits(this.parent)).concat(sjcl.codec.bytes.fromBits(bitcoin.util.intToBits(this.child))).concat(sjcl.codec.bytes.fromBits(this.chain)).concat([ 0 ].concat(sjcl.codec.bytes.fromBits(this.prv)));
        return prv;
    };
})();

"use strict";

bitcoin.HDMasterKey = {};

(function() {
    var SEED = "Bitcoin seed";
    var HDMasterKey = bitcoin.HDMasterKey = function(seed) {
        var seedBits = seed ? sjcl.codec.hex.toBits(seed) : sjcl.random.randomWords(8);
        var masterSeed = new sjcl.misc.hmac(sjcl.codec.utf8String.toBits(SEED), sjcl.hash.sha512).encrypt(seedBits);
        var masterKey = new bitcoin.HDKey({
            prv: sjcl.bitArray.bitSlice(masterSeed, 0, 256),
            chain: sjcl.bitArray.bitSlice(masterSeed, 256)
        });
        return masterKey;
    };
})();

bitcoin.mnemonic = {};

(function() {
    function mod(a, b) {
        return (a % b + b) % b;
    }
    function div(a, b) {
        return Math.floor(a / b);
    }
    var mnemonic = bitcoin.mnemonic = {
        words: [ "like", "just", "love", "know", "never", "want", "time", "out", "there", "make", "look", "eye", "down", "only", "think", "heart", "back", "then", "into", "about", "more", "away", "still", "them", "take", "thing", "even", "through", "long", "always", "world", "too", "friend", "tell", "try", "hand", "thought", "over", "here", "other", "need", "smile", "again", "much", "cry", "been", "night", "ever", "little", "said", "end", "some", "those", "around", "mind", "people", "girl", "leave", "dream", "left", "turn", "myself", "give", "nothing", "really", "off", "before", "something", "find", "walk", "wish", "good", "once", "place", "ask", "stop", "keep", "watch", "seem", "everything", "wait", "got", "yet", "made", "remember", "start", "alone", "run", "hope", "maybe", "believe", "body", "hate", "after", "close", "talk", "stand", "own", "each", "hurt", "help", "home", "god", "soul", "new", "many", "two", "inside", "should", "true", "first", "fear", "mean", "better", "play", "another", "gone", "change", "use", "wonder", "someone", "hair", "cold", "open", "best", "any", "behind", "happen", "water", "dark", "laugh", "stay", "forever", "name", "work", "show", "sky", "break", "came", "deep", "door", "put", "black", "together", "upon", "happy", "such", "great", "white", "matter", "fill", "past", "please", "burn", "cause", "enough", "touch", "moment", "soon", "voice", "scream", "anything", "stare", "sound", "red", "everyone", "hide", "kiss", "truth", "death", "beautiful", "mine", "blood", "broken", "very", "pass", "next", "forget", "tree", "wrong", "air", "mother", "understand", "lip", "hit", "wall", "memory", "sleep", "free", "high", "realize", "school", "might", "skin", "sweet", "perfect", "blue", "kill", "breath", "dance", "against", "fly", "between", "grow", "strong", "under", "listen", "bring", "sometimes", "speak", "pull", "person", "become", "family", "begin", "ground", "real", "small", "father", "sure", "feet", "rest", "young", "finally", "land", "across", "today", "different", "guy", "line", "fire", "reason", "reach", "second", "slowly", "write", "eat", "smell", "mouth", "step", "learn", "three", "floor", "promise", "breathe", "darkness", "push", "earth", "guess", "save", "song", "above", "along", "both", "color", "house", "almost", "sorry", "anymore", "brother", "okay", "dear", "game", "fade", "already", "apart", "warm", "beauty", "heard", "notice", "question", "shine", "began", "piece", "whole", "shadow", "secret", "street", "within", "finger", "point", "morning", "whisper", "child", "moon", "green", "story", "glass", "kid", "silence", "since", "soft", "yourself", "empty", "shall", "angel", "answer", "baby", "bright", "dad", "path", "worry", "hour", "drop", "follow", "power", "war", "half", "flow", "heaven", "act", "chance", "fact", "least", "tired", "children", "near", "quite", "afraid", "rise", "sea", "taste", "window", "cover", "nice", "trust", "lot", "sad", "cool", "force", "peace", "return", "blind", "easy", "ready", "roll", "rose", "drive", "held", "music", "beneath", "hang", "mom", "paint", "emotion", "quiet", "clear", "cloud", "few", "pretty", "bird", "outside", "paper", "picture", "front", "rock", "simple", "anyone", "meant", "reality", "road", "sense", "waste", "bit", "leaf", "thank", "happiness", "meet", "men", "smoke", "truly", "decide", "self", "age", "book", "form", "alive", "carry", "escape", "damn", "instead", "able", "ice", "minute", "throw", "catch", "leg", "ring", "course", "goodbye", "lead", "poem", "sick", "corner", "desire", "known", "problem", "remind", "shoulder", "suppose", "toward", "wave", "drink", "jump", "woman", "pretend", "sister", "week", "human", "joy", "crack", "grey", "pray", "surprise", "dry", "knee", "less", "search", "bleed", "caught", "clean", "embrace", "future", "king", "son", "sorrow", "chest", "hug", "remain", "sat", "worth", "blow", "daddy", "final", "parent", "tight", "also", "create", "lonely", "safe", "cross", "dress", "evil", "silent", "bone", "fate", "perhaps", "anger", "class", "scar", "snow", "tiny", "tonight", "continue", "control", "dog", "edge", "mirror", "month", "suddenly", "comfort", "given", "loud", "quickly", "gaze", "plan", "rush", "stone", "town", "battle", "ignore", "spirit", "stood", "stupid", "yours", "brown", "build", "dust", "hey", "kept", "pay", "phone", "twist", "although", "ball", "beyond", "hidden", "nose", "taken", "fail", "float", "pure", "somehow", "wash", "wrap", "angry", "cheek", "creature", "forgotten", "heat", "rip", "single", "space", "special", "weak", "whatever", "yell", "anyway", "blame", "job", "choose", "country", "curse", "drift", "echo", "figure", "grew", "laughter", "neck", "suffer", "worse", "yeah", "disappear", "foot", "forward", "knife", "mess", "somewhere", "stomach", "storm", "beg", "idea", "lift", "offer", "breeze", "field", "five", "often", "simply", "stuck", "win", "allow", "confuse", "enjoy", "except", "flower", "seek", "strength", "calm", "grin", "gun", "heavy", "hill", "large", "ocean", "shoe", "sigh", "straight", "summer", "tongue", "accept", "crazy", "everyday", "exist", "grass", "mistake", "sent", "shut", "surround", "table", "ache", "brain", "destroy", "heal", "nature", "shout", "sign", "stain", "choice", "doubt", "glance", "glow", "mountain", "queen", "stranger", "throat", "tomorrow", "city", "either", "fish", "flame", "rather", "shape", "spin", "spread", "ash", "distance", "finish", "image", "imagine", "important", "nobody", "shatter", "warmth", "became", "feed", "flesh", "funny", "lust", "shirt", "trouble", "yellow", "attention", "bare", "bite", "money", "protect", "amaze", "appear", "born", "choke", "completely", "daughter", "fresh", "friendship", "gentle", "probably", "six", "deserve", "expect", "grab", "middle", "nightmare", "river", "thousand", "weight", "worst", "wound", "barely", "bottle", "cream", "regret", "relationship", "stick", "test", "crush", "endless", "fault", "itself", "rule", "spill", "art", "circle", "join", "kick", "mask", "master", "passion", "quick", "raise", "smooth", "unless", "wander", "actually", "broke", "chair", "deal", "favorite", "gift", "note", "number", "sweat", "box", "chill", "clothes", "lady", "mark", "park", "poor", "sadness", "tie", "animal", "belong", "brush", "consume", "dawn", "forest", "innocent", "pen", "pride", "stream", "thick", "clay", "complete", "count", "draw", "faith", "press", "silver", "struggle", "surface", "taught", "teach", "wet", "bless", "chase", "climb", "enter", "letter", "melt", "metal", "movie", "stretch", "swing", "vision", "wife", "beside", "crash", "forgot", "guide", "haunt", "joke", "knock", "plant", "pour", "prove", "reveal", "steal", "stuff", "trip", "wood", "wrist", "bother", "bottom", "crawl", "crowd", "fix", "forgive", "frown", "grace", "loose", "lucky", "party", "release", "surely", "survive", "teacher", "gently", "grip", "speed", "suicide", "travel", "treat", "vein", "written", "cage", "chain", "conversation", "date", "enemy", "however", "interest", "million", "page", "pink", "proud", "sway", "themselves", "winter", "church", "cruel", "cup", "demon", "experience", "freedom", "pair", "pop", "purpose", "respect", "shoot", "softly", "state", "strange", "bar", "birth", "curl", "dirt", "excuse", "lord", "lovely", "monster", "order", "pack", "pants", "pool", "scene", "seven", "shame", "slide", "ugly", "among", "blade", "blonde", "closet", "creek", "deny", "drug", "eternity", "gain", "grade", "handle", "key", "linger", "pale", "prepare", "swallow", "swim", "tremble", "wheel", "won", "cast", "cigarette", "claim", "college", "direction", "dirty", "gather", "ghost", "hundred", "loss", "lung", "orange", "present", "swear", "swirl", "twice", "wild", "bitter", "blanket", "doctor", "everywhere", "flash", "grown", "knowledge", "numb", "pressure", "radio", "repeat", "ruin", "spend", "unknown", "buy", "clock", "devil", "early", "false", "fantasy", "pound", "precious", "refuse", "sheet", "teeth", "welcome", "add", "ahead", "block", "bury", "caress", "content", "depth", "despite", "distant", "marry", "purple", "threw", "whenever", "bomb", "dull", "easily", "grasp", "hospital", "innocence", "normal", "receive", "reply", "rhyme", "shade", "someday", "sword", "toe", "visit", "asleep", "bought", "center", "consider", "flat", "hero", "history", "ink", "insane", "muscle", "mystery", "pocket", "reflection", "shove", "silently", "smart", "soldier", "spot", "stress", "train", "type", "view", "whether", "bus", "energy", "explain", "holy", "hunger", "inch", "magic", "mix", "noise", "nowhere", "prayer", "presence", "shock", "snap", "spider", "study", "thunder", "trail", "admit", "agree", "bag", "bang", "bound", "butterfly", "cute", "exactly", "explode", "familiar", "fold", "further", "pierce", "reflect", "scent", "selfish", "sharp", "sink", "spring", "stumble", "universe", "weep", "women", "wonderful", "action", "ancient", "attempt", "avoid", "birthday", "branch", "chocolate", "core", "depress", "drunk", "especially", "focus", "fruit", "honest", "match", "palm", "perfectly", "pillow", "pity", "poison", "roar", "shift", "slightly", "thump", "truck", "tune", "twenty", "unable", "wipe", "wrote", "coat", "constant", "dinner", "drove", "egg", "eternal", "flight", "flood", "frame", "freak", "gasp", "glad", "hollow", "motion", "peer", "plastic", "root", "screen", "season", "sting", "strike", "team", "unlike", "victim", "volume", "warn", "weird", "attack", "await", "awake", "built", "charm", "crave", "despair", "fought", "grant", "grief", "horse", "limit", "message", "ripple", "sanity", "scatter", "serve", "split", "string", "trick", "annoy", "blur", "boat", "brave", "clearly", "cling", "connect", "fist", "forth", "imagination", "iron", "jock", "judge", "lesson", "milk", "misery", "nail", "naked", "ourselves", "poet", "possible", "princess", "sail", "size", "snake", "society", "stroke", "torture", "toss", "trace", "wise", "bloom", "bullet", "cell", "check", "cost", "darling", "during", "footstep", "fragile", "hallway", "hardly", "horizon", "invisible", "journey", "midnight", "mud", "nod", "pause", "relax", "shiver", "sudden", "value", "youth", "abuse", "admire", "blink", "breast", "bruise", "constantly", "couple", "creep", "curve", "difference", "dumb", "emptiness", "gotta", "honor", "plain", "planet", "recall", "rub", "ship", "slam", "soar", "somebody", "tightly", "weather", "adore", "approach", "bond", "bread", "burst", "candle", "coffee", "cousin", "crime", "desert", "flutter", "frozen", "grand", "heel", "hello", "language", "level", "movement", "pleasure", "powerful", "random", "rhythm", "settle", "silly", "slap", "sort", "spoken", "steel", "threaten", "tumble", "upset", "aside", "awkward", "bee", "blank", "board", "button", "card", "carefully", "complain", "crap", "deeply", "discover", "drag", "dread", "effort", "entire", "fairy", "giant", "gotten", "greet", "illusion", "jeans", "leap", "liquid", "march", "mend", "nervous", "nine", "replace", "rope", "spine", "stole", "terror", "accident", "apple", "balance", "boom", "childhood", "collect", "demand", "depression", "eventually", "faint", "glare", "goal", "group", "honey", "kitchen", "laid", "limb", "machine", "mere", "mold", "murder", "nerve", "painful", "poetry", "prince", "rabbit", "shelter", "shore", "shower", "soothe", "stair", "steady", "sunlight", "tangle", "tease", "treasure", "uncle", "begun", "bliss", "canvas", "cheer", "claw", "clutch", "commit", "crimson", "crystal", "delight", "doll", "existence", "express", "fog", "football", "gay", "goose", "guard", "hatred", "illuminate", "mass", "math", "mourn", "rich", "rough", "skip", "stir", "student", "style", "support", "thorn", "tough", "yard", "yearn", "yesterday", "advice", "appreciate", "autumn", "bank", "beam", "bowl", "capture", "carve", "collapse", "confusion", "creation", "dove", "feather", "girlfriend", "glory", "government", "harsh", "hop", "inner", "loser", "moonlight", "neighbor", "neither", "peach", "pig", "praise", "screw", "shield", "shimmer", "sneak", "stab", "subject", "throughout", "thrown", "tower", "twirl", "wow", "army", "arrive", "bathroom", "bump", "cease", "cookie", "couch", "courage", "dim", "guilt", "howl", "hum", "husband", "insult", "led", "lunch", "mock", "mostly", "natural", "nearly", "needle", "nerd", "peaceful", "perfection", "pile", "price", "remove", "roam", "sanctuary", "serious", "shiny", "shook", "sob", "stolen", "tap", "vain", "void", "warrior", "wrinkle", "affection", "apologize", "blossom", "bounce", "bridge", "cheap", "crumble", "decision", "descend", "desperately", "dig", "dot", "flip", "frighten", "heartbeat", "huge", "lazy", "lick", "odd", "opinion", "process", "puzzle", "quietly", "retreat", "score", "sentence", "separate", "situation", "skill", "soak", "square", "stray", "taint", "task", "tide", "underneath", "veil", "whistle", "anywhere", "bedroom", "bid", "bloody", "burden", "careful", "compare", "concern", "curtain", "decay", "defeat", "describe", "double", "dreamer", "driver", "dwell", "evening", "flare", "flicker", "grandma", "guitar", "harm", "horrible", "hungry", "indeed", "lace", "melody", "monkey", "nation", "object", "obviously", "rainbow", "salt", "scratch", "shown", "shy", "stage", "stun", "third", "tickle", "useless", "weakness", "worship", "worthless", "afternoon", "beard", "boyfriend", "bubble", "busy", "certain", "chin", "concrete", "desk", "diamond", "doom", "drawn", "due", "felicity", "freeze", "frost", "garden", "glide", "harmony", "hopefully", "hunt", "jealous", "lightning", "mama", "mercy", "peel", "physical", "position", "pulse", "punch", "quit", "rant", "respond", "salty", "sane", "satisfy", "savior", "sheep", "slept", "social", "sport", "tuck", "utter", "valley", "wolf", "aim", "alas", "alter", "arrow", "awaken", "beaten", "belief", "brand", "ceiling", "cheese", "clue", "confidence", "connection", "daily", "disguise", "eager", "erase", "essence", "everytime", "expression", "fan", "flag", "flirt", "foul", "fur", "giggle", "glorious", "ignorance", "law", "lifeless", "measure", "mighty", "muse", "north", "opposite", "paradise", "patience", "patient", "pencil", "petal", "plate", "ponder", "possibly", "practice", "slice", "spell", "stock", "strife", "strip", "suffocate", "suit", "tender", "tool", "trade", "velvet", "verse", "waist", "witch", "aunt", "bench", "bold", "cap", "certainly", "click", "companion", "creator", "dart", "delicate", "determine", "dish", "dragon", "drama", "drum", "dude", "everybody", "feast", "forehead", "former", "fright", "fully", "gas", "hook", "hurl", "invite", "juice", "manage", "moral", "possess", "raw", "rebel", "royal", "scale", "scary", "several", "slight", "stubborn", "swell", "talent", "tea", "terrible", "thread", "torment", "trickle", "usually", "vast", "violence", "weave", "acid", "agony", "ashamed", "awe", "belly", "blend", "blush", "character", "cheat", "common", "company", "coward", "creak", "danger", "deadly", "defense", "define", "depend", "desperate", "destination", "dew", "duck", "dusty", "embarrass", "engine", "example", "explore", "foe", "freely", "frustrate", "generation", "glove", "guilty", "health", "hurry", "idiot", "impossible", "inhale", "jaw", "kingdom", "mention", "mist", "moan", "mumble", "mutter", "observe", "ode", "pathetic", "pattern", "pie", "prefer", "puff", "rape", "rare", "revenge", "rude", "scrape", "spiral", "squeeze", "strain", "sunset", "suspend", "sympathy", "thigh", "throne", "total", "unseen", "weapon", "weary" ],
        encodeHex: function(message) {
            var n = this.words.length;
            var result = [];
            for (var i = 0; i < div(message.length, 8); i++) {
                var word = message.substr(8 * i, 8);
                var hex = parseInt(word, 16);
                if (isNaN(hex)) throw new Error('"' + word + '" is not a valid hex value');
                var w1 = mod(hex, n);
                var w2 = mod(div(hex, n) + w1, n);
                var w3 = mod(div(div(hex, n), n) + w2, n);
                result.push(this.words[w1], this.words[w2], this.words[w3]);
            }
            return result;
        },
        encodeUtf8: function(message) {
            var hex = sjcl.codec.hex.fromBits(sjcl.codec.utf8String.toBits(message));
            return mnemonic.encodeHex(hex);
        },
        decodeHex: function(wlist) {
            var result = "";
            var n = this.words.length;
            for (var i = 0; i < div(wlist.length, 3); i++) {
                var word1 = wlist[3 * i];
                var word2 = wlist[3 * i + 1];
                var word3 = wlist[3 * i + 2];
                var w1 = this.words.indexOf(word1);
                var w2 = mod(this.words.indexOf(word2), n);
                var w3 = mod(this.words.indexOf(word3), n);
                var number = w1 + mod(w2 - w1, n) * n + mod(w3 - w2, n) * n * n;
                var hex = number.toString(16);
                while (hex.length < 8) {
                    hex = "0" + hex;
                }
                result += hex;
            }
            return result;
        },
        decodeUtf8: function(message) {
            var mnemonicHex = mnemonic.decodeHex(message);
            return sjcl.codec.utf8String.fromBits(sjcl.codec.hex.toBits(mnemonicHex));
        }
    };
})();

"use strict";

bitcoin.MultiSigKey = {};

(function() {
    var MultiSigKey = bitcoin.MultiSigKey = function(hdKeys, reqSignatories, unsorted, opts) {
        if (hdKeys.length > 22 || hdKeys.length < 2 || reqSignatories > hdKeys.length) {
            throw new Error("Only m of 2 to 22 supported");
        }
        this.selectedOuts = [];
        this.reqSig = reqSignatories;
        this.hdKeys = hdKeys;
        this.unsorted = unsorted;
        if (!this.unsorted) {
            this.sortHdKeys();
            return;
        }
        this._generateRedeemScript();
    };
    MultiSigKey.prototype._generateRedeemScript = function() {
        var pubKeys = [];
        for (var i = 0; i < this.hdKeys.length; i++) {
            pubKeys[i] = sjcl.codec.bytes.fromBits(this.hdKeys[i].pub);
        }
        this.redeemScript = bitcoin.Script.createMultiSigOutputScript(this.reqSig, pubKeys);
        this.address = this.getAddress().toString();
    };
    MultiSigKey.prototype.sortHdKeys = function() {
        for (var i = 0; i < this.hdKeys.length; i++) {
            for (var j = 0; j < this.hdKeys.length; j++) {
                var a = sjcl.bn.fromBits(this.hdKeys[j].pub);
                var b = sjcl.bn.fromBits(this.hdKeys[i].pub);
                if (a.greaterEquals(b)) {
                    var temp = this.hdKeys[i];
                    this.hdKeys[i] = this.hdKeys[j];
                    this.hdKeys[j] = temp;
                }
            }
        }
        this._generateRedeemScript();
    };
    MultiSigKey.prototype.getAddress = function() {
        var redempScript = sjcl.codec.bytes.toBits(this.redeemScript.buffer);
        var address = sjcl.codec.bytes.fromBits(bitcoin.util.sha256ripe160(redempScript));
        return new bitcoin.Address(address, bitcoin.Address.versions.bitcoin.production.p2sh);
    };
    MultiSigKey.prototype.derivePublic = function(i) {
        var derivedKeys = [];
        for (var i = 0; i < this.hdKeys.length; i++) {
            derivedKeys.push(this.hdKeys[i].derivePublic(i));
        }
        return new MultiSigKey(derivedKeys, this.reqSig, this.unsorted);
    };
    MultiSigKey.prototype.verifyScript = function() {};
    MultiSigKey.prototype.createFundTx = function(unspentOutputs, amount, fee, changeAdd) {
        var feeValue = fee || 5e-4;
        var sendTx = new bitcoin.Transaction();
        var txAmount = new sjcl.bn(Math.round(amount * 1e8));
        var txValue = txAmount.add(new sjcl.bn(Math.round(feeValue * 1e8)));
        var availableValue = new sjcl.bn(0);
        for (var i = 0; i < unspentOutputs.length; i++) {
            var tx = {
                hash: sjcl.codec.base64.fromBits(sjcl.codec.hex.toBits(unspentOutputs[i].txid))
            };
            var txN = unspentOutputs[i].vout;
            unspentOutputs[i].out = {
                script: new bitcoin.Script(sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(unspentOutputs[i].scriptPubKey)))
            };
            this.selectedOuts.push(unspentOutputs[i]);
            availableValue = availableValue.add(new sjcl.bn(Math.round(unspentOutputs[i].amount * 1e8)));
            sendTx.addInput(tx, txN);
        }
        var changeValue = availableValue.sub(txValue);
        sendTx.addOutput(new bitcoin.Address(this.getAddress().toString()), txAmount);
        if (changeValue.greaterEquals(new sjcl.bn(0))) {
            var changeAddress = changeAdd || unspentOutputs[0].address;
            sendTx.addOutput(new bitcoin.Address(changeAddress), changeValue);
        }
        return sendTx;
    };
    MultiSigKey.prototype.signFundTx = function(sendTx, privateKey) {
        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var hash = sendTx.hashTransactionForSignature(this.selectedOuts[i].out.script, i, hashType);
            var pubKeyHash = this.selectedOuts[i].out.script.simpleOutPubKeyHash();
            var ecKey = new bitcoin.ECKey(privateKey);
            ecKey.compressed = true;
            var signature = sjcl.codec.bytes.fromBits(ecKey.sign(sjcl.codec.bytes.toBits(hash)));
            signature.push(parseInt(hashType, 10));
            sendTx.ins[i].script = new bitcoin.Script.createInputScript(signature, sjcl.codec.bytes.fromBits(ecKey.getPub()));
        }
        return sendTx;
    };
    MultiSigKey.prototype.sign = function(tx, privateKeys) {
        var sendTx = tx.deserialize(tx);
        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var hash = sendTx.hashTransactionForSignature(this.redeemScript, i, hashType);
            var script = new bitcoin.Script();
            script.writeOp(0);
            for (var j = 0; j < this.hdKeys.length; j++) {
                var hdKey = this.hdKeys[j];
                if (hdKey.prv) {
                    var signature = sjcl.codec.bytes.fromBits(this.hdKeys[j].sign(sjcl.codec.bytes.toBits(hash)));
                    signature.push(parseInt(hashType, 10));
                    script.writeBytes(signature);
                }
            }
            script.writeBytes(this.redeemScript.buffer);
            sendTx.ins[i].script = script;
        }
        return sendTx;
    };
})();

"use strict";

bitcoin.Opcode = {};

(function() {
    var Opcode = bitcoin.Opcode = function(num) {
        this.code = num;
    };
    Opcode.prototype.toString = function() {
        return Opcode.reverseMap[this.code];
    };
    Opcode.map = {
        OP_0: 0,
        OP_FALSE: 0,
        OP_PUSHDATA1: 76,
        OP_PUSHDATA2: 77,
        OP_PUSHDATA4: 78,
        OP_1NEGATE: 79,
        OP_RESERVED: 80,
        OP_1: 81,
        OP_TRUE: 81,
        OP_2: 82,
        OP_3: 83,
        OP_4: 84,
        OP_5: 85,
        OP_6: 86,
        OP_7: 87,
        OP_8: 88,
        OP_9: 89,
        OP_10: 90,
        OP_11: 91,
        OP_12: 92,
        OP_13: 93,
        OP_14: 94,
        OP_15: 95,
        OP_16: 96,
        OP_NOP: 97,
        OP_VER: 98,
        OP_IF: 99,
        OP_NOTIF: 100,
        OP_VERIF: 101,
        OP_VERNOTIF: 102,
        OP_ELSE: 103,
        OP_ENDIF: 104,
        OP_VERIFY: 105,
        OP_RETURN: 106,
        OP_TOALTSTACK: 107,
        OP_FROMALTSTACK: 108,
        OP_2DROP: 109,
        OP_2DUP: 110,
        OP_3DUP: 111,
        OP_2OVER: 112,
        OP_2ROT: 113,
        OP_2SWAP: 114,
        OP_IFDUP: 115,
        OP_DEPTH: 116,
        OP_DROP: 117,
        OP_DUP: 118,
        OP_NIP: 119,
        OP_OVER: 120,
        OP_PICK: 121,
        OP_ROLL: 122,
        OP_ROT: 123,
        OP_SWAP: 124,
        OP_TUCK: 125,
        OP_CAT: 126,
        OP_SUBSTR: 127,
        OP_LEFT: 128,
        OP_RIGHT: 129,
        OP_SIZE: 130,
        OP_INVERT: 131,
        OP_AND: 132,
        OP_OR: 133,
        OP_XOR: 134,
        OP_EQUAL: 135,
        OP_EQUALVERIFY: 136,
        OP_RESERVED1: 137,
        OP_RESERVED2: 138,
        OP_1ADD: 139,
        OP_1SUB: 140,
        OP_2MUL: 141,
        OP_2DIV: 142,
        OP_NEGATE: 143,
        OP_ABS: 144,
        OP_NOT: 145,
        OP_0NOTEQUAL: 146,
        OP_ADD: 147,
        OP_SUB: 148,
        OP_MUL: 149,
        OP_DIV: 150,
        OP_MOD: 151,
        OP_LSHIFT: 152,
        OP_RSHIFT: 153,
        OP_BOOLAND: 154,
        OP_BOOLOR: 155,
        OP_NUMEQUAL: 156,
        OP_NUMEQUALVERIFY: 157,
        OP_NUMNOTEQUAL: 158,
        OP_LESSTHAN: 159,
        OP_GREATERTHAN: 160,
        OP_LESSTHANOREQUAL: 161,
        OP_GREATERTHANOREQUAL: 162,
        OP_MIN: 163,
        OP_MAX: 164,
        OP_WITHIN: 165,
        OP_RIPEMD160: 166,
        OP_SHA1: 167,
        OP_SHA256: 168,
        OP_HASH160: 169,
        OP_HASH256: 170,
        OP_CODESEPARATOR: 171,
        OP_CHECKSIG: 172,
        OP_CHECKSIGVERIFY: 173,
        OP_CHECKMULTISIG: 174,
        OP_CHECKMULTISIGVERIFY: 175,
        OP_NOP1: 176,
        OP_NOP2: 177,
        OP_NOP3: 178,
        OP_NOP4: 179,
        OP_NOP5: 180,
        OP_NOP6: 181,
        OP_NOP7: 182,
        OP_NOP8: 183,
        OP_NOP9: 184,
        OP_NOP10: 185,
        OP_PUBKEYHASH: 253,
        OP_PUBKEY: 254,
        OP_INVALIDOPCODE: 255
    };
    Opcode.reverseMap = [];
    for (var i in Opcode.map) {
        Opcode.reverseMap[Opcode.map[i]] = i;
    }
})();

bitcoin.Script = {};

(function() {
    var Opcode = bitcoin.Opcode.map;
    var Address = bitcoin.Address;
    function sha256ripe160(hash) {
        return sjcl.codec.bytes.fromBits(bitcoin.Util.sha256ripe160(sjcl.codec.bytes.toBits(this.simpleInPubKey())));
    }
    var Script = bitcoin.Script = function(data) {
        if (!data) {
            this.buffer = [];
        } else if ("string" == typeof data) {
            this.buffer = sjcl.codec.bytes.fromBits(sjcl.codec.base64.toBits(data));
        } else if (data instanceof Array) {
            this.buffer = data;
        } else if (data instanceof Script) {
            this.buffer = data.buffer;
        } else {
            throw new Error("Invalid script");
        }
        this.parse();
    };
    Script.prototype.parse = function() {
        var self = this;
        this.chunks = [];
        var i = 0;
        function readChunk(n) {
            self.chunks.push(self.buffer.slice(i, i + n));
            i += n;
        }
        while (i < this.buffer.length) {
            var opcode = this.buffer[i++];
            if (opcode >= 240) {
                opcode = opcode << 8 | this.buffer[i++];
            }
            var len;
            if (opcode > 0 && opcode < Opcode.OP_PUSHDATA1) {
                readChunk(opcode);
            } else if (opcode == Opcode.OP_PUSHDATA1) {
                len = this.buffer[i++];
                readChunk(len);
            } else if (opcode == Opcode.OP_PUSHDATA2) {
                len = this.buffer[i++] << 8 | this.buffer[i++];
                readChunk(len);
            } else if (opcode == Opcode.OP_PUSHDATA4) {
                len = this.buffer[i++] << 24 | this.buffer[i++] << 16 | this.buffer[i++] << 8 | this.buffer[i++];
                readChunk(len);
            } else {
                this.chunks.push(opcode);
            }
        }
    };
    Script.prototype.getOutType = function() {
        if (this.chunks[this.chunks.length - 1] == Opcode.OP_CHECKMULTISIG && this.chunks[this.chunks.length - 2] <= 3) {
            return "Multisig";
        } else if (this.chunks.length == 5 && this.chunks[0] == Opcode.OP_DUP && this.chunks[1] == Opcode.OP_HASH160 && this.chunks[3] == Opcode.OP_EQUALVERIFY && this.chunks[4] == Opcode.OP_CHECKSIG) {
            return "Address";
        } else if (this.chunks.length == 3 && this.chunks[0] == Opcode.OP_HASH160 && this.chunks[2] == Opcode.OP_EQUAL) {
            return "P2SH";
        } else if (this.chunks.length == 2 && this.chunks[1] == Opcode.OP_CHECKSIG) {
            return "Pubkey";
        } else {
            return "Strange";
        }
    };
    Script.prototype.simpleOutHash = function() {
        switch (this.getOutType()) {
          case "Address":
            return this.chunks[2];

          case "Pubkey":
            return sha256ripe160(this.chunks[0]);

          case "P2SH":
            return this.chunks[1];

          default:
            throw new Error("Encountered non-standard scriptPubKey");
        }
    };
    Script.prototype.simpleOutPubKeyHash = Script.prototype.simpleOutHash;
    Script.prototype.simpleInHash = function() {
        return sha256ripe160(this.simpleInPubKey());
    };
    Script.prototype.simpleInPubKeyHash = Script.prototype.simpleInHash;
    Script.prototype.writeOp = function(opcode) {
        this.buffer.push(opcode);
        this.chunks.push(opcode);
    };
    Script.prototype.writeBytes = function(data) {
        if (data.length < Opcode.OP_PUSHDATA1) {
            this.buffer.push(data.length);
        } else if (data.length <= 255) {
            this.buffer.push(Opcode.OP_PUSHDATA1);
            this.buffer.push(data.length);
        } else if (data.length <= 65535) {
            this.buffer.push(Opcode.OP_PUSHDATA2);
            this.buffer.push(data.length & 255);
            this.buffer.push(data.length >>> 8 & 255);
        } else {
            this.buffer.push(Opcode.OP_PUSHDATA4);
            this.buffer.push(data.length & 255);
            this.buffer.push(data.length >>> 8 & 255);
            this.buffer.push(data.length >>> 16 & 255);
            this.buffer.push(data.length >>> 24 & 255);
        }
        this.buffer = this.buffer.concat(data);
        this.chunks.push(data);
    };
    Script.createOutputScript = function(address) {
        var script = new Script();
        if (address.isPubKey()) {
            script.writeOp(Opcode.OP_DUP);
            script.writeOp(Opcode.OP_HASH160);
            script.writeBytes(address.hash);
            script.writeOp(Opcode.OP_EQUALVERIFY);
            script.writeOp(Opcode.OP_CHECKSIG);
            return script;
        } else if (address.isP2SH()) {
            script.writeOp(Opcode.OP_HASH160);
            script.writeBytes(address.hash);
            script.writeOp(Opcode.OP_EQUAL);
            return script;
        } else {
            throw "Unknown address version";
        }
    };
    Script.prototype.extractAddresses = function(addresses) {
        switch (this.getOutType()) {
          case "Address":
            addresses.push(new bitcoin.Address(this.chunks[2]));
            return 1;

          case "Pubkey":
            addresses.push(new bitcoin.Address(sha256ripe160(this.chunks[0])));
            return 1;

          case "P2SH":
            addresses.push(new bitcoin.Address(this.chunks[1], bitcoin.Address.p2shVersion));
            return 1;

          case "Multisig":
            for (var i = 1; i < this.chunks.length - 2; ++i) {
                addresses.push(new bitcoin.Address(sha256ripe160(this.chunks[i])));
            }
            return this.chunks[0] - Opcode.OP_1 + 1;

          default:
            throw new Error("Encountered non-standard scriptPubKey");
        }
    };
    Script.createMultiSigOutputScript = function(m, pubkeys) {
        var script = new Script();
        script.writeOp(Opcode.OP_1 + m - 1);
        for (var i = 0; i < pubkeys.length; ++i) {
            script.writeBytes(pubkeys[i]);
        }
        script.writeOp(Opcode.OP_1 + pubkeys.length - 1);
        script.writeOp(Opcode.OP_CHECKMULTISIG);
        return script;
    };
    Script.createInputScript = function(signature, pubKey) {
        var script = new Script();
        script.writeBytes(signature);
        script.writeBytes(pubKey);
        return script;
    };
    Script.prototype.clone = function() {
        return new Script(this.buffer);
    };
})();

bitcoin.Transaction = {};

(function() {
    var OP_CODESEPARATOR = 171;
    var SIGHASH_ALL = 1;
    var SIGHASH_NONE = 2;
    var SIGHASH_SINGLE = 3;
    var SIGHASH_ANYONECANPAY = 80;
    function uint(f, size) {
        if (f.length < size) return 0;
        var bytes = f.slice(0, size);
        var pos = 1;
        var n = 0;
        for (var i = 0; i < size; i++) {
            var b = f.shift();
            n += b * pos;
            pos *= 256;
        }
        return size <= 4 ? n : bytes;
    }
    function u8(f) {
        return uint(f, 1);
    }
    function u16(f) {
        return uint(f, 2);
    }
    function u32(f) {
        return uint(f, 4);
    }
    function u64(f) {
        return uint(f, 8);
    }
    function errv(val) {
        return val instanceof BigInteger || val > 65535;
    }
    function readBuffer(f, size) {
        var res = f.slice(0, size);
        for (var i = 0; i < size; i++) f.shift();
        return res;
    }
    function readString(f) {
        var len = readVarInt(f);
        if (errv(len)) return [];
        return readBuffer(f, len);
    }
    function readVarInt(f) {
        var t = u8(f);
        if (t == 253) return u16(f); else if (t == 254) return u32(f); else if (t == 255) return u64(f); else return t;
    }
    var Script = bitcoin.Script;
    var Transaction = bitcoin.Transaction = function(doc) {
        this.version = 1;
        this.lock_time = 0;
        this.ins = [];
        this.outs = [];
        this.timestamp = null;
        this.block = null;
        if (doc) {
            if (doc.hash) this.hash = doc.hash;
            if (doc.version) this.version = doc.version;
            if (doc.lock_time) this.lock_time = doc.lock_time;
            if (doc.ins && doc.ins.length) {
                for (var i = 0; i < doc.ins.length; i++) {
                    this.addInput(new TransactionIn(doc.ins[i]));
                }
            }
            if (doc.outs && doc.outs.length) {
                for (var i = 0; i < doc.outs.length; i++) {
                    this.addOutput(new TransactionOut(doc.outs[i]));
                }
            }
            if (doc.timestamp) this.timestamp = doc.timestamp;
            if (doc.block) this.block = doc.block;
        }
    };
    Transaction.deserialize = function(bytes) {
        var sendTx = new bitcoin.Transaction();
        var f = bytes.slice(0);
        var tx_ver = u32(f);
        var vin_sz = readVarInt(f);
        if (errv(vin_sz)) return null;
        for (var i = 0; i < vin_sz; i++) {
            var op = readBuffer(f, 32);
            var n = u32(f);
            var script = readString(f);
            var seq = u32(f);
            var txin = new bitcoin.TransactionIn({
                outpoint: {
                    hash: sjcl.codec.base64.fromBits(sjcl.codec.bytes.toBits(op)),
                    index: n
                },
                script: new bitcoin.Script(script),
                sequence: seq
            });
            sendTx.addInput(txin);
        }
        var vout_sz = readVarInt(f);
        if (errv(vout_sz)) return null;
        for (var i = 0; i < vout_sz; i++) {
            var value = u64(f);
            var script = readString(f);
            var txout = new bitcoin.TransactionOut({
                value: value,
                script: new bitcoin.Script(script)
            });
            sendTx.addOutput(txout);
        }
        var lock_time = u32(f);
        sendTx.lock_time = lock_time;
        return sendTx;
    };
    Transaction.objectify = function(txs) {
        var objs = [];
        for (var i = 0; i < txs.length; i++) {
            objs.push(new Transaction(txs[i]));
        }
        return objs;
    };
    Transaction.prototype.addInput = function(tx, outIndex) {
        if (arguments[0] instanceof TransactionIn) {
            this.ins.push(arguments[0]);
        } else {
            this.ins.push(new TransactionIn({
                outpoint: {
                    hash: tx.hash,
                    index: outIndex
                },
                script: new bitcoin.Script(),
                sequence: 4294967295
            }));
        }
    };
    Transaction.prototype.addOutput = function(address, value) {
        if (arguments[0] instanceof TransactionOut) {
            this.outs.push(arguments[0]);
        } else {
            if (value instanceof sjcl.bn) {
                value = sjcl.codec.bytes.fromBits(value.toBits()).reverse();
                while (value.length < 8) value.push(0);
            } else if (value instanceof Array) {}
            this.outs.push(new TransactionOut({
                value: value,
                script: Script.createOutputScript(address)
            }));
        }
    };
    Transaction.prototype.serialize = function() {
        var buffer = [];
        buffer = buffer.concat(bitcoin.util.wordsToBytes([ parseInt(this.version) ]).reverse());
        buffer = buffer.concat(bitcoin.util.numToVarInt(this.ins.length));
        for (var i = 0; i < this.ins.length; i++) {
            var txin = this.ins[i];
            buffer = buffer.concat(sjcl.codec.bytes.fromBits(sjcl.codec.base64.toBits(txin.outpoint.hash)).reverse());
            buffer = buffer.concat(bitcoin.util.wordsToBytes([ parseInt(txin.outpoint.index) ]).reverse());
            var scriptBytes = txin.script.buffer;
            buffer = buffer.concat(bitcoin.util.numToVarInt(scriptBytes.length));
            buffer = buffer.concat(scriptBytes);
            buffer = buffer.concat(bitcoin.util.wordsToBytes([ parseInt(txin.sequence) ]).reverse());
        }
        buffer = buffer.concat(bitcoin.util.numToVarInt(this.outs.length));
        for (var i = 0; i < this.outs.length; i++) {
            var txout = this.outs[i];
            buffer = buffer.concat(txout.value);
            var scriptBytes = txout.script.buffer;
            buffer = buffer.concat(bitcoin.util.numToVarInt(scriptBytes.length));
            buffer = buffer.concat(scriptBytes);
        }
        buffer = buffer.concat(bitcoin.util.wordsToBytes([ parseInt(this.lock_time) ]).reverse());
        return buffer;
    };
    Transaction.prototype.hashTransactionForSignature = function(connectedScript, inIndex, hashType) {
        var txTmp = this.clone();
        for (var i = 0; i < txTmp.ins.length; i++) {
            txTmp.ins[i].script = new Script();
        }
        txTmp.ins[inIndex].script = connectedScript;
        if ((hashType & 31) == SIGHASH_NONE) {
            txTmp.outs = [];
            for (var i = 0; i < txTmp.ins.length; i++) if (i != inIndex) txTmp.ins[i].sequence = 0;
        } else if ((hashType & 31) == SIGHASH_SINGLE) {}
        if (hashType & SIGHASH_ANYONECANPAY) {
            txTmp.ins = [ txTmp.ins[inIndex] ];
        }
        var buffer = txTmp.serialize();
        buffer = buffer.concat(bitcoin.util.wordsToBytes([ parseInt(hashType) ]).reverse());
        return bitcoin.util.sha256sha256(buffer);
    };
    Transaction.prototype.getHash = function() {
        var buffer = this.serialize();
        return Crypto.SHA256(Crypto.SHA256(buffer, {
            asBytes: true
        }), {
            asBytes: true
        });
    };
    Transaction.prototype.clone = function() {
        var newTx = new Transaction();
        newTx.version = this.version;
        newTx.lock_time = this.lock_time;
        for (var i = 0; i < this.ins.length; i++) {
            var txin = this.ins[i].clone();
            newTx.addInput(txin);
        }
        for (var i = 0; i < this.outs.length; i++) {
            var txout = this.outs[i].clone();
            newTx.addOutput(txout);
        }
        return newTx;
    };
    Transaction.prototype.addOutputScript = function(script, value) {
        if (arguments[0] instanceof TransactionOut) {
            this.outs.push(arguments[0]);
        } else {
            if (value instanceof BigInteger) {
                value = value.toByteArrayUnsigned().reverse();
                while (value.length < 8) value.push(0);
            } else if (Bitcoin.Util.isArray(value)) {}
            this.outs.push(new TransactionOut({
                value: value,
                script: script
            }));
        }
    };
    Transaction.prototype.analyze = function(wallet) {
        if (!(wallet instanceof Bitcoin.Wallet)) return null;
        var allFromMe = true, allToMe = true, firstRecvHash = null, firstMeRecvHash = null, firstSendHash = null;
        for (var i = this.outs.length - 1; i >= 0; i--) {
            var txout = this.outs[i];
            var hash = txout.script.simpleOutPubKeyHash();
            if (!wallet.hasHash(hash)) {
                allToMe = false;
            } else {
                firstMeRecvHash = hash;
            }
            firstRecvHash = hash;
        }
        for (var i = this.ins.length - 1; i >= 0; i--) {
            var txin = this.ins[i];
            firstSendHash = txin.script.simpleInPubKeyHash();
            if (!wallet.hasHash(firstSendHash)) {
                allFromMe = false;
                break;
            }
        }
        var impact = this.calcImpact(wallet);
        var analysis = {};
        analysis.impact = impact;
        if (impact.sign > 0 && impact.value.compareTo(BigInteger.ZERO) > 0) {
            analysis.type = "recv";
            analysis.addr = new Bitcoin.Address(firstMeRecvHash);
        } else if (allFromMe && allToMe) {
            analysis.type = "self";
        } else if (allFromMe) {
            analysis.type = "sent";
            analysis.addr = new Bitcoin.Address(firstRecvHash);
        } else {
            analysis.type = "other";
        }
        return analysis;
    };
    Transaction.prototype.getDescription = function(wallet) {
        var analysis = this.analyze(wallet);
        if (!analysis) return "";
        switch (analysis.type) {
          case "recv":
            return "Received with " + analysis.addr;
            break;

          case "sent":
            return "Payment to " + analysis.addr;
            break;

          case "self":
            return "Payment to yourself";
            break;

          case "other":
          default:
            return "";
        }
    };
    Transaction.prototype.getTotalOutValue = function() {
        var totalValue = new sjcl.bn(0);
        for (var j = 0; j < this.outs.length; j++) {
            var txout = this.outs[j];
            totalValue = totalValue.add(new sjcl.bn(txout.value));
        }
        return totalValue;
    };
    Transaction.prototype.getTotalValue = Transaction.prototype.getTotalOutValue;
    Transaction.prototype.calcImpact = function(wallet) {
        if (!(wallet instanceof Bitcoin.Wallet)) return BigInteger.ZERO;
        var valueOut = BigInteger.ZERO;
        for (var j = 0; j < this.outs.length; j++) {
            var txout = this.outs[j];
            var hash = Crypto.util.bytesToBase64(txout.script.simpleOutPubKeyHash());
            if (wallet.hasHash(hash)) {
                valueOut = valueOut.add(Bitcoin.Util.valueToBigInt(txout.value));
            }
        }
        var valueIn = BigInteger.ZERO;
        for (var j = 0; j < this.ins.length; j++) {
            var txin = this.ins[j];
            var hash = Crypto.util.bytesToBase64(txin.script.simpleInPubKeyHash());
            if (wallet.hasHash(hash)) {
                var fromTx = wallet.txIndex[txin.outpoint.hash];
                if (fromTx) {
                    valueIn = valueIn.add(Bitcoin.Util.valueToBigInt(fromTx.outs[txin.outpoint.index].value));
                }
            }
        }
        if (valueOut.compareTo(valueIn) >= 0) {
            return {
                sign: 1,
                value: valueOut.subtract(valueIn)
            };
        } else {
            return {
                sign: -1,
                value: valueIn.subtract(valueOut)
            };
        }
    };
    var TransactionIn = function(data) {
        this.outpoint = data.outpoint;
        if (data.script instanceof Script) {
            this.script = data.script;
        } else {
            this.script = new Script(data.script);
        }
        this.sequence = data.sequence;
    };
    TransactionIn.prototype.clone = function() {
        var newTxin = new TransactionIn({
            outpoint: {
                hash: this.outpoint.hash,
                index: this.outpoint.index
            },
            script: this.script.clone(),
            sequence: this.sequence
        });
        return newTxin;
    };
    var TransactionOut = function(data) {
        if (data.script instanceof Script) {
            this.script = data.script;
        } else {
            this.script = new Script(data.script);
        }
        if (data.value instanceof Array) {
            this.value = data.value;
        } else if ("string" == typeof data.value) {
            var valueHex = new BigInteger(data.value, 10).toString(16);
            while (valueHex.length < 16) valueHex = "0" + valueHex;
            this.value = sjcl.codec.bytes.fromBits(sjcl.codec.hex.toBits(valueHex));
        }
    };
    TransactionOut.prototype.clone = function() {
        var newTxout = new TransactionOut({
            script: this.script.clone(),
            value: this.value.slice(0)
        });
        return newTxout;
    };
})();

"use strict";

bitcoin.util = {};

(function() {
    var util = bitcoin.util;
    util.intToBits = function(i) {
        return sjcl.codec.bytes.toBits([ i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, i & 255 ]);
    };
    util.sha256sha256 = function(message) {
        return sjcl.codec.bytes.fromBits(sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(sjcl.codec.bytes.toBits(message))));
    };
    util.sha256ripe160 = function(pubKey) {
        return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(pubKey));
    };
    util.wordsToBytes = function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8) bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
        return bytes;
    };
    util.numToVarInt = function(i) {
        if (i < 253) {
            return [ i ];
        } else if (i <= 1 << 16) {
            return [ 253, i >>> 8, i & 255 ];
        } else if (i <= 1 << 32) {
            return [ 254 ].concat(this.wordsToBytes([ i ]));
        } else {
            return [ 255 ].concat(this.wordsToBytes([ i >>> 32, i ]));
        }
    };
})();

"use strict";

bitcoin.WalletCredentials = {};

(function() {
    var defaults = {
        iterations: 2e3
    };
    var WalletCredentials = bitcoin.WalletCredentials = function(id, password, opts) {
        opts = opts || defaults;
        this.id = id;
        var prk = sjcl.codec.bytes.fromBits(sjcl.misc.pbkdf2(password, this.id, opts.iterations, 256));
        Object.defineProperty(this, "encryptionKey", {
            enumerable: false,
            value: sjcl.misc.hkdf.expand(prk, "encryption key")
        });
        this.walletId = sjcl.misc.hkdf.expand(prk, "server identifier");
    };
})();

"use strict";

bitcoin.Wallet = {};

(function() {
    var Account = function(HDKey) {
        this.addresses = [];
        this.internalAddresses = [];
        this.HDKey = HDKey.derivePublic(0);
        this.HDKeyInternal = HDKey.derivePublic(1);
    };
    Account.prototype.getNextInternalAddress = function() {
        var hdKey = this.HDKeyInternal.derivePublic(this.internalAddresses.length);
        this.internalAddresses.push(hdKey.address);
        return hdKey;
    };
    Account.createTx = function(unspent, amount, address, fee) {};
    var Wallet = bitcoin.Wallet = function(masterKey) {
        this.masterKey = masterKey;
        this.accounts = [];
    };
    Wallet.prototype.createStandardAccount = function() {
        var account = new Account(this.masterKey.derivePrivate(this.accounts.length + 2147483648));
        this.accounts.push(account);
    };
    Wallet.prototype.createMultiSigAccount = function(otherParties, reqSigs, unsorted) {
        var multiSigKey = new bitcoin.MultiSigKey([ this.masterKey.derivePrivate(this.accounts.length + 2147483648) ].concat(otherParties), reqSigs, unsorted);
        var account = new Account(multiSigKey);
        this.accounts.push(account);
    };
    Wallet.init = function() {
        var masterKey = new bitcoin.HDMasterKey();
        return new Wallet(masterKey);
    };
})();