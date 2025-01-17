// @ts-nocheck
// https://zingl.github.io/bresenham.js

export function bline(x0: number, y0: number, x1: number, y1: number, setPixel: Function) {
    var dx = Math.abs(x1 - x0),
        sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1 - y0),
        sy = y0 < y1 ? 1 : -1;
    var err = (dx > dy ? dx : -dy) / 2;
    while (true) {
        setPixel(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dy) {
            err += dx;
            y0 += sy;
        }
    }
}

function plotQuadBezierSeg(x0, y0, x1, y1, x2, y2, setPixel) {
    /* plot a limited quadratic Bezier segment */
    var sx = x2 - x1,
        sy = y2 - y1;
    var xx = x0 - x1,
        yy = y0 - y1,
        xy; /* relative values for checks */
    var dx,
        dy,
        err,
        cur = xx * sy - yy * sx; /* curvature */

    if (sx * sx + sy * sy > xx * xx + yy * yy) {
        /* begin with shorter part */
        x2 = x0;
        x0 = sx + x1;
        y2 = y0;
        y0 = sy + y1;
        cur = -cur; /* swap P0 P2 */
    }
    if (cur != 0) {
        /* no straight line */
        xx += sx;
        xx *= sx = x0 < x2 ? 1 : -1; /* x step direction */
        yy += sy;
        yy *= sy = y0 < y2 ? 1 : -1; /* y step direction */
        xy = 2 * xx * yy;
        xx *= xx;
        yy *= yy; /* differences 2nd degree */
        if (cur * sx * sy < 0) {
            /* negated curvature? */
            xx = -xx;
            yy = -yy;
            xy = -xy;
            cur = -cur;
        }
        dx = 4.0 * sy * cur * (x1 - x0) + xx - xy; /* differences 1st degree */
        dy = 4.0 * sx * cur * (y0 - y1) + yy - xy;
        xx += xx;
        yy += yy;
        err = dx + dy + xy; /* error 1st step */
        do {
            setPixel(x0, y0); /* plot curve */
            if (x0 == x2 && y0 == y2) return; /* last pixel -> curve finished */
            y1 = 2 * err < dx; /* save value for test of y step */
            if (2 * err > dy) {
                x0 += sx;
                dx -= xy;
                err += dy += yy;
            } /* x step */
            if (y1) {
                y0 += sy;
                dy -= xy;
                err += dx += xx;
            } /* y step */
        } while (dy < 0 && dx > 0); /* gradient negates -> algorithm fails */
    } /* plot remaining part to end */
}

function plotCubicBezierSeg(x0, y0, x1, y1, x2, y2, x3, y3, setPixel) {
    /* plot limited cubic Bezier segment */
    var f,
        fx,
        fy,
        leg = 1;
    var sx = x0 < x3 ? 1 : -1,
        sy = y0 < y3 ? 1 : -1; /* step direction */
    var xc = -Math.abs(x0 + x1 - x2 - x3),
        xa = xc - 4 * sx * (x1 - x2),
        xb = sx * (x0 - x1 - x2 + x3);
    var yc = -Math.abs(y0 + y1 - y2 - y3),
        ya = yc - 4 * sy * (y1 - y2),
        yb = sy * (y0 - y1 - y2 + y3);
    var ab,
        ac,
        bc,
        cb,
        xx,
        xy,
        yy,
        dx,
        dy,
        ex,
        pxy,
        EP = 0.01;
    /* check for curve restrains */

    if (xa == 0 && ya == 0)
        /* quadratic Bezier */
        return plotQuadBezierSeg(x0, y0, (3 * x1 - x0) >> 1, (3 * y1 - y0) >> 1, x3, y3, setPixel);
    x1 = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + 1; /* line lengths */
    x2 = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3) + 1;

    do {
        /* loop over both ends */
        ab = xa * yb - xb * ya;
        ac = xa * yc - xc * ya;
        bc = xb * yc - xc * yb;
        ex = ab * (ab + ac - 3 * bc) + ac * ac; /* P0 part of self-intersection loop? */
        f = ex > 0 ? 1 : Math.floor(Math.sqrt(1 + 1024 / x1)); /* calc resolution */
        ab *= f;
        ac *= f;
        bc *= f;
        ex *= f * f; /* increase resolution */
        xy = (9 * (ab + ac + bc)) / 8;
        cb = 8 * (xa - ya); /* init differences of 1st degree */
        dx =
            (27 * (8 * ab * (yb * yb - ya * yc) + ex * (ya + 2 * yb + yc))) / 64 -
            ya * ya * (xy - ya);
        dy =
            (27 * (8 * ab * (xb * xb - xa * xc) - ex * (xa + 2 * xb + xc))) / 64 -
            xa * xa * (xy + xa);
        /* init differences of 2nd degree */
        xx =
            (3 *
                (3 * ab * (3 * yb * yb - ya * ya - 2 * ya * yc) -
                    ya * (3 * ac * (ya + yb) + ya * cb))) /
            4;
        yy =
            (3 *
                (3 * ab * (3 * xb * xb - xa * xa - 2 * xa * xc) -
                    xa * (3 * ac * (xa + xb) + xa * cb))) /
            4;
        xy = xa * ya * (6 * ab + 6 * ac - 3 * bc + cb);
        ac = ya * ya;
        cb = xa * xa;
        xy = (3 * (xy + 9 * f * (cb * yb * yc - xb * xc * ac) - 18 * xb * yb * ab)) / 8;

        if (ex < 0) {
            /* negate values if inside self-intersection loop */
            dx = -dx;
            dy = -dy;
            xx = -xx;
            yy = -yy;
            xy = -xy;
            ac = -ac;
            cb = -cb;
        } /* init differences of 3rd degree */
        ab = 6 * ya * ac;
        ac = -6 * xa * ac;
        bc = 6 * ya * cb;
        cb = -6 * xa * cb;
        dx += xy;
        ex = dx + dy;
        dy += xy; /* error of 1st step */
        exit: for (pxy = 0, fx = fy = f; x0 != x3 && y0 != y3; ) {
            setPixel(x0, y0); /* plot curve */
            do {
                /* move sub-steps of one pixel */
                if (pxy == 0) if (dx > xy || dy < xy) break exit; /* confusing */
                if (pxy == 1) if (dx > 0 || dy < 0) break exit; /* values */
                y1 = 2 * ex - dy; /* save value for test of y step */
                if (2 * ex >= dx) {
                    /* x sub-step */
                    fx--;
                    ex += dx += xx;
                    dy += xy += ac;
                    yy += bc;
                    xx += ab;
                } else if (y1 > 0) break exit;
                if (y1 <= 0) {
                    /* y sub-step */
                    fy--;
                    ex += dy += yy;
                    dx += xy += bc;
                    xx += ac;
                    yy += cb;
                }
            } while (fx > 0 && fy > 0); /* pixel complete? */
            if (2 * fx <= f) {
                x0 += sx;
                fx += f;
            } /* x step */
            if (2 * fy <= f) {
                y0 += sy;
                fy += f;
            } /* y step */
            if (pxy == 0 && dx < 0 && dy > 0) pxy = 1; /* pixel ahead valid */
        }
        xx = x0;
        x0 = x3;
        x3 = xx;
        sx = -sx;
        xb = -xb; /* swap legs */
        yy = y0;
        y0 = y3;
        y3 = yy;
        sy = -sy;
        yb = -yb;
        x1 = x2;
    } while (leg--); /* try other end */
    bline(x0, y0, x3, y3, setPixel); /* remaining part in case of cusp or crunode */
}

export function plotCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, setPixel) {
    /* plot any cubic Bezier curve */
    var n = 0,
        i = 0;
    var xc = x0 + x1 - x2 - x3,
        xa = xc - 4 * (x1 - x2);
    var xb = x0 - x1 - x2 + x3,
        xd = xb + 4 * (x1 + x2);
    var yc = y0 + y1 - y2 - y3,
        ya = yc - 4 * (y1 - y2);
    var yb = y0 - y1 - y2 + y3,
        yd = yb + 4 * (y1 + y2);
    var fx0 = x0,
        fx1,
        fx2,
        fx3,
        fy0 = y0,
        fy1,
        fy2,
        fy3;
    var t1 = xb * xb - xa * xc,
        t2,
        t = new Array(5);
    /* sub-divide curve at gradient sign changes */
    if (xa == 0) {
        /* horizontal */
        if (Math.abs(xc) < 2 * Math.abs(xb)) t[n++] = xc / (2.0 * xb); /* one change */
    } else if (t1 > 0.0) {
        /* two changes */
        t2 = Math.sqrt(t1);
        t1 = (xb - t2) / xa;
        if (Math.abs(t1) < 1.0) t[n++] = t1;
        t1 = (xb + t2) / xa;
        if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = yb * yb - ya * yc;
    if (ya == 0) {
        /* vertical */
        if (Math.abs(yc) < 2 * Math.abs(yb)) t[n++] = yc / (2.0 * yb); /* one change */
    } else if (t1 > 0.0) {
        /* two changes */
        t2 = Math.sqrt(t1);
        t1 = (yb - t2) / ya;
        if (Math.abs(t1) < 1.0) t[n++] = t1;
        t1 = (yb + t2) / ya;
        if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    for (i = 1; i < n; i++ /* bubble sort of 4 points */)
        if ((t1 = t[i - 1]) > t[i]) {
            t[i - 1] = t[i];
            t[i] = t1;
            i = 0;
        }

    t1 = -1.0;
    t[n] = 1.0; /* begin / end point */
    for (i = 0; i <= n; i++) {
        /* plot each segment separately */
        t2 = t[i]; /* sub-divide at t[i-1], t[i] */
        fx1 = (t1 * (t1 * xb - 2 * xc) - t2 * (t1 * (t1 * xa - 2 * xb) + xc) + xd) / 8 - fx0;
        fy1 = (t1 * (t1 * yb - 2 * yc) - t2 * (t1 * (t1 * ya - 2 * yb) + yc) + yd) / 8 - fy0;
        fx2 = (t2 * (t2 * xb - 2 * xc) - t1 * (t2 * (t2 * xa - 2 * xb) + xc) + xd) / 8 - fx0;
        fy2 = (t2 * (t2 * yb - 2 * yc) - t1 * (t2 * (t2 * ya - 2 * yb) + yc) + yd) / 8 - fy0;
        fx0 -= fx3 = (t2 * (t2 * (3 * xb - t2 * xa) - 3 * xc) + xd) / 8;
        fy0 -= fy3 = (t2 * (t2 * (3 * yb - t2 * ya) - 3 * yc) + yd) / 8;
        x3 = Math.floor(fx3 + 0.5);
        y3 = Math.floor(fy3 + 0.5); /* scale bounds */
        if (fx0 != 0.0) {
            fx1 *= fx0 = (x0 - x3) / fx0;
            fx2 *= fx0;
        }
        if (fy0 != 0.0) {
            fy1 *= fy0 = (y0 - y3) / fy0;
            fy2 *= fy0;
        }
        if (x0 != x3 || y0 != y3)
            /* segment t1 - t2 */
            plotCubicBezierSeg(x0, y0, x0 + fx1, y0 + fy1, x0 + fx2, y0 + fy2, x3, y3, setPixel);
        x0 = x3;
        y0 = y3;
        fx0 = fx3;
        fy0 = fy3;
        t1 = t2;
    }
}
