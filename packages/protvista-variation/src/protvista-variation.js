import ProtvistaTrack from "protvista-track";
import { scaleLinear, scalePoint, axisLeft, axisRight } from "d3";
import processVariants from "./processVariants";
import VariationPlot from "./variationPlot";

const aaList = [
  "G",
  "A",
  "V",
  "L",
  "I",
  "S",
  "T",
  "C",
  "M",
  "D",
  "N",
  "E",
  "Q",
  "R",
  "K",
  "H",
  "F",
  "Y",
  "W",
  "P",
  "d",
  "*"
];

class ProtvistaVariation extends ProtvistaTrack {
  connectedCallback() {
    super.connectedCallback();
    const styleElt = document.createElement("style");
    styleElt.innerHTML = ProtvistaVariation.css;
    this.appendChild(styleElt);
    this._height = Number(this.getAttribute("height"))
      ? Number(this.getAttribute("height"))
      : 430;
    this._width = this._width ? this._width : 0;
    this._yScale = scaleLinear();
    // scale for Amino Acids
    this._yScale = scalePoint()
      .domain(aaList)
      .range([0, this._height - this.margin.top - this.margin.bottom]);
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    super.attributeChangedCallback(attrName, oldVal, newVal);
  }

  set data(data) {
    this._data = processVariants(data);
    this._createTrack();
  }

  static get css() {
    return `
    <style>
    protvista-variation {
      display: flex;
      width: 100%;
    }
    
    protvista-variation svg {
      background-color: #fff;
    }
    
    protvista-variation circle {
      opacity: 0.6;
    }
    protvista-variation circle:hover {
      opacity: 0.9;
    }
    protvista-variation .tick line,
    protvista-variation .axis path {
      opacity: 0.1;
    }
    
    .protvista-highlight {
      fill: #ffe999;
    }
    
    protvista-variation .variation-y-right line,
    protvista-variation .axis path {
      fill: none;
      stroke: none;
    }
    
    </style>
    `;
  }

  _createFeatures() {
    this._variationPlot = new VariationPlot();
    // Group for the main chart
    const mainChart = super.svg.select("g.sequence-features");

    // clip path prevents drawing outside of it
    const chartArea = mainChart
      .attr("transform", `translate(0, ${this.margin.top})`)
      .append("g")
      .attr("clip-path", "url(#plotAreaClip)");

    this._clipPath = mainChart
      .append("clipPath")
      .attr("id", "plotAreaClip")
      .append("rect")
      .attr("width", this.getWidthWithMargins())
      .attr("height", this._height)
      .attr("transform", `translate(0, -${this.margin.top})`);

    // This is calling the data series render code for each of the items in the data
    this._series = chartArea.datum(this._data);

    this._axisLeft = mainChart.append("g");

    this._axisRight = mainChart.append("g");

    this.updateScale();
  }

  // Calling render again
  refresh() {
    if (this._series) {
      this._clipPath.attr("width", this.getWidthWithMargins());
      this.updateScale();
      this._series.call(this._variationPlot.drawVariationPlot, this);
      this._updateHighlight();
    }
  }

  updateScale() {
    this._yAxisLScale = axisLeft()
      .scale(this._yScale)
      .tickSize(-this.getWidthWithMargins());

    this._yAxisRScale = axisRight().scale(this._yScale);

    this._axisLeft
      .attr("class", "variation-y-left axis")
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(this._yAxisLScale);

    this._axisRight
      .attr(
        "transform",
        `translate(${this.getWidthWithMargins() - this.margin.right + 2}, 0)`
      )
      .attr("class", "variation-y-right axis")
      .call(this._yAxisRScale);
  }

  updateData(data) {
    if (this._series) {
      this._series.datum(data);
    }
  }
}

export default ProtvistaVariation;
