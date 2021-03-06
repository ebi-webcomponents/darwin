export default class Region {
  constructor({ min = -Infinity, max = Infinity } = {}) {
    this.segments = [];
    this.max = max;
    this.min = min;
    this.regionString = null;
  }

  encode(full = false) {
    return this.segments
      .map(({ start, end, color }) => {
        if (full) return `${start}:${end}${color ? `:${color}` : ""}`;
        const s = start === this.min ? "" : start;
        const e = end === this.max ? "" : end;
        return `${s}:${e}${color ? `:${color}` : ""}`;
      })
      .join(",");
  }

  decode(regionString) {
    if (typeof regionString !== "undefined") this.regionString = regionString;
    if (!this.regionString) {
      this.segments = [];
      return;
    }
    this.segments = this.regionString.split(",").map((region) => {
      const [_start, _end, _color, _] = region.split(":");
      if (typeof _ !== "undefined")
        throw new Error(
          `there should be at most 2 ':' per region. Region: ${region}`
        );
      let start = _start ? Number(_start) : this.min;
      let end = _end ? Number(_end) : this.max;
      const color = _color !== "" ? _color : undefined;
      if (start > end) [start, end] = [end, start];
      if (start < this.min) start = this.min;
      if (end > this.max) end = this.max;
      if (Number.isNaN(start))
        throw new Error(
          `The parsed value of ${_start} is NaN. Region: ${region}`
        );
      if (Number.isNaN(end))
        throw new Error(
          `The parsed value of ${_end} is NaN. Region: ${region}`
        );
      if (color && !color.match(/^#[0-9a-f]{6,8}$/i))
        throw new Error(
          `The parsed value of ${_color} is not a color in hex format. Region: ${region}`
        );

      return {
        start,
        end,
        color,
      };
    });
  }
}
