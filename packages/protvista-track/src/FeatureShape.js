/* eslint-disable prefer-template, no-param-reassign  */
/* jslint node: true */
const symbolSize = 10;

export default class FeatureShape {
  getFeatureShape(aaWidth, ftHeight, ftLength, shape) {
    shape = shape || "rectangle";
    this._ftLength = ftLength;
    this._ftHeight = ftHeight;
    this._ftWidth = aaWidth * ftLength;
    if (typeof this["_" + shape] !== "function") {
      shape = "rectangle";
    }
    return this["_" + shape]();
  }

  static isContinuous(shape) {
    shape = shape.toLowerCase();
    return shape !== "bridge";
  }

  _rectangle() {
    return (
      "M0,0" +
      "L" +
      this._ftWidth +
      ",0" +
      "L" +
      this._ftWidth +
      "," +
      this._ftHeight +
      "L0," +
      this._ftHeight +
      "Z"
    );
  }

  _roundRectangle() {
    const radius = 6;
    return (
      "M" +
      radius +
      ",0" +
      "h" +
      (this._ftWidth - 2 * radius) +
      ",0" +
      "a" +
      radius +
      "," +
      radius +
      " 0 0 1 " +
      radius +
      "," +
      radius +
      "v" +
      (this._ftHeight - 2 * radius) +
      "a" +
      radius +
      "," +
      radius +
      " 0 0 1 " +
      -radius +
      "," +
      radius +
      "h" +
      (2 * radius - this._ftWidth) +
      "a" +
      radius +
      "," +
      radius +
      " 0 0 1 " +
      -radius +
      "," +
      -radius +
      "v" +
      (2 * radius - this._ftHeight) +
      "a" +
      radius +
      "," +
      radius +
      " 0 0 1 " +
      radius +
      "," +
      -radius +
      "Z"
    );
  }

  _bridge() {
    if (this._ftLength !== 1) {
      return (
        "M0," +
        this._ftHeight +
        "L0,0" +
        "L" +
        this._ftWidth +
        ",0" +
        "L" +
        this._ftWidth +
        "," +
        this._ftHeight +
        "L" +
        this._ftWidth +
        ",2" +
        "L0,2" +
        "Z"
      );
    }
    return (
      "M0," +
      this._ftHeight +
      "L0," +
      this._ftHeight / 2 +
      "L" +
      this._ftWidth / 2 +
      "," +
      this._ftHeight / 2 +
      "L" +
      this._ftWidth / 2 +
      ",0" +
      "L" +
      this._ftWidth / 2 +
      "," +
      this._ftHeight / 2 +
      "L" +
      this._ftWidth +
      "," +
      this._ftHeight / 2 +
      "L" +
      this._ftWidth +
      "," +
      this._ftHeight +
      "Z"
    );
  }

  _getMiddleLine(centerx) {
    return "M0," + centerx + "L" + this._ftWidth + "," + centerx + "Z";
  }

  _diamond() {
    const centerx = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
      "M" +
      m +
      ",0" +
      "L" +
      (m + centerx) +
      "," +
      centerx +
      "L" +
      m +
      "," +
      symbolSize +
      "L" +
      (m - centerx) +
      "," +
      centerx;
    return this._ftLength !== 1
      ? shape + this._getMiddleLine(centerx, this._ftWidth)
      : shape + "Z";
  }

  _chevron() {
    const m = this._ftWidth / 2;
    const centerx = symbolSize / 2;
    const shape =
      "M" +
      m +
      "," +
      centerx +
      "L" +
      (centerx + m) +
      ",0" +
      "L" +
      (centerx + m) +
      "," +
      centerx +
      "L" +
      m +
      "," +
      symbolSize +
      "L" +
      (-centerx + m) +
      "," +
      centerx +
      "L" +
      (-centerx + m) +
      ",0";
    return this._ftLength !== 1
      ? shape +
          "L" +
          m +
          "," +
          centerx +
          this._getMiddleLine(centerx, this._ftWidth) +
          "Z"
      : shape + "Z";
  }

  _catFace() {
    const centerx = symbolSize / 2;
    const step = symbolSize / 10;
    const m = this._ftWidth / 2;
    const shape =
      "M" +
      (-centerx + m) +
      ",0" +
      "L" +
      (-centerx + m) +
      "," +
      6 * step +
      "L" +
      (-2 * step + m) +
      "," +
      symbolSize +
      "L" +
      (2 * step + m) +
      "," +
      symbolSize +
      "L" +
      (centerx + m) +
      "," +
      6 * step +
      "L" +
      (centerx + m) +
      ",0" +
      "L" +
      (2 * step + m) +
      "," +
      4 * step +
      "L" +
      (-2 * step + m) +
      "," +
      4 * step;
    return this._ftLength !== 1
      ? shape +
          "M" +
          m +
          ",0" +
          this._getMiddleLine(centerx, this._ftWidth) +
          "Z"
      : shape + "Z";
  }

  _triangle() {
    const centerx = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
      "M" +
      m +
      ",0" +
      "L" +
      (centerx + m) +
      "," +
      symbolSize +
      "L" +
      (-centerx + m) +
      "," +
      symbolSize;
    return this._ftLength !== 1
      ? shape +
          "L" +
          m +
          ",0" +
          this._getMiddleLine(centerx, this._ftWidth) +
          "Z"
      : shape + "Z";
  }

  _wave() {
    const rx = symbolSize / 4;
    const ry = symbolSize / 2;
    const m = this._ftWidth / 2;
    const shape =
      "M" +
      (-symbolSize / 2 + m) +
      "," +
      ry +
      "A" +
      rx +
      "," +
      ry +
      " 0 1,1 " +
      m +
      "," +
      ry +
      "A" +
      rx +
      "," +
      ry +
      " 0 1,0 " +
      (symbolSize / 2 + m) +
      "," +
      ry;
    return this._ftLength !== 1
      ? shape + this._getMiddleLine(ry, this._ftWidth) + "Z"
      : shape + "Z";
  }

  _getPolygon(sidesNumber) {
    const r = symbolSize / 2;
    let polygon = "M ";
    const m = this._ftWidth / 2;
    for (let i = 0; i < sidesNumber; i++) {
      polygon +=
        r * Math.cos((2 * Math.PI * i) / sidesNumber) +
        m +
        "," +
        (r * Math.sin((2 * Math.PI * i) / sidesNumber) + r) +
        " ";
    }
    return this._ftLength !== 1
      ? polygon +
          " " +
          (r * Math.cos(0) + m) +
          "," +
          (r * Math.sin(0) + r) +
          " " +
          this._getMiddleLine(r, this._ftWidth) +
          "Z"
      : polygon + "Z";
  }

  _hexagon() {
    return this._getPolygon(6);
  }

  _pentagon() {
    return this._getPolygon(5);
  }

  _circle() {
    const m = this._ftWidth / 2;
    const r = Math.sqrt(symbolSize / Math.PI);
    const shape =
      "M" +
      m +
      ",0" +
      "A" +
      r +
      "," +
      r +
      " 0 1,1 " +
      m +
      "," +
      symbolSize +
      "A" +
      r +
      "," +
      r +
      " 0 1,1 " +
      m +
      ",0";
    return this._ftLength !== 1
      ? shape + this._getMiddleLine(symbolSize / 2, this._ftWidth) + "Z"
      : shape + "Z";
  }

  _arrow() {
    const step = symbolSize / 10;
    const m = this._ftWidth / 2;
    const shape =
      "M" +
      m +
      ",0" +
      "L" +
      (-step + m) +
      ",0" +
      "L" +
      (-5 * step + m) +
      "," +
      4 * step +
      "L" +
      (-step + m) +
      "," +
      this._ftHeight +
      "L" +
      m +
      "," +
      this._ftHeight +
      "L" +
      (4 * step + m) +
      "," +
      4 * step;
    return this._ftLength !== 1
      ? shape +
          "L" +
          m +
          ",0" +
          this._getMiddleLine(symbolSize / 2, this._ftWidth) +
          "Z"
      : shape + "Z";
  }

  _doubleBar() {
    const m = this._ftWidth / 2;
    const centerx = symbolSize / 2;
    const shape =
      "M" +
      m +
      ",0" +
      "L" +
      (-centerx + m) +
      "," +
      symbolSize +
      "L" +
      m +
      "," +
      symbolSize +
      "L" +
      (centerx + m) +
      ",0";
    return this._ftLength !== 1
      ? shape +
          "L" +
          m +
          ",0" +
          this._getMiddleLine(symbolSize / 2, this._ftWidth) +
          "Z"
      : shape + "Z";
  }

  _getBrokenEnd() {
    const qh = this._ftHeight / 4.0;
    return (
      "L" +
      (this._ftWidth - qh) +
      "," +
      qh +
      "L" +
      this._ftWidth +
      "," +
      2 * qh +
      "L" +
      (this._ftWidth - qh) +
      "," +
      3 * qh +
      "L" +
      this._ftWidth +
      "," +
      this._ftHeight
    );
  }

  _getBrokenStart() {
    const qh = this._ftHeight / 4.0;
    return "L" + qh + "," + 3 * qh + "L0," + 2 * qh + "L" + qh + "," + qh;
  }

  _discontinuosStart() {
    return (
      "M0,0" +
      "L" +
      this._ftWidth +
      ",0" +
      "L" +
      this._ftWidth +
      "," +
      this._ftHeight +
      "L0," +
      this._ftHeight +
      this._getBrokenStart() +
      "Z"
    );
  }

  _discontinuos() {
    return (
      "M0,0" +
      "L" +
      this._ftWidth +
      ",0" +
      this._getBrokenEnd() +
      "L0," +
      this._ftHeight +
      this._getBrokenStart() +
      "Z"
    );
  }

  _discontinuosEnd() {
    return (
      "M0,0" +
      "L" +
      this._ftWidth +
      ",0" +
      this._getBrokenEnd() +
      "L0," +
      this._ftHeight +
      "Z"
    );
  }

  _helix() {
    const x = symbolSize / 2; // Fitting two loops in a symbol
    const y = symbolSize / 4;
    let center = x / 2;
    const nw = Math.round(this._ftWidth / symbolSize);

    let loop = "";
    for (let i = 0; i < nw; i++) {
      const shape =
        "M" +
        (-(x / 2) + center) +
        "," +
        this._ftHeight +
        " C" +
        (center + y) +
        "," +
        3 * y +
        " " +
        (x / 2 + center) +
        "," +
        y +
        " " +
        center +
        ", 0" +
        " C" +
        (center - y) +
        "," +
        y +
        " " +
        center +
        "," +
        3 * y +
        " " +
        (x / 2 + center) +
        "," +
        this._ftHeight;
      loop += shape;
      center += x;
    }
    return loop;
  }

  _strand() {
    let rl = 0;
    if (this._ftWidth > symbolSize / 2) {
      rl = this._ftWidth - symbolSize / 2;
    }
    const qh = this._ftHeight / 4;
    const rect =
      "M0," +
      qh +
      "L" +
      rl +
      "," +
      qh +
      "L" +
      rl +
      "," +
      3 * qh +
      "L0," +
      3 * qh +
      "L0," +
      qh;
    const triangle =
      "M" +
      rl +
      "," +
      0 +
      "L" +
      this._ftWidth +
      "," +
      2 * qh +
      "L" +
      rl +
      "," +
      this._ftHeight +
      "Z";
    return rect + triangle;
  }
}
