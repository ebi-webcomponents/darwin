import { select } from "d3";
import _includes from "lodash-es/includes";

import ProtvistaZoomable from "protvista-zoomable";
import FeatureShape from "./FeatureShape";
import NonOverlappingLayout from "./NonOverlappingLayout";
import DefaultLayout from "./DefaultLayout";
import { getShapeByType, getColorByType } from "./ConfigHelper";

class ProtvistaTrack extends ProtvistaZoomable {
  getLayout() {
    if (String(this.getAttribute("layout")).toLowerCase() === "non-overlapping")
      return new NonOverlappingLayout({
        layoutHeight: this._height
      });
    return new DefaultLayout({
      layoutHeight: this._height
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._color = this.getAttribute("color");
    this._shape = this.getAttribute("shape");
    this._featureShape = new FeatureShape();
    this._layoutObj = this.getLayout();

    if (this._data) this._createTrack();

    this.addEventListener("load", e => {
      if (_includes(this.children, e.target)) {
        this.data = e.detail.payload;
      }
    });
  }

  static normalizeLocations(data) {
    return data.map(obj => {
      const { locations, start, end } = obj;
      return locations
        ? obj
        : Object.assign(obj, {
            locations: [
              {
                fragments: [
                  {
                    start,
                    end
                  }
                ]
              }
            ]
          });
    });
  }

  set data(data) {
    this._data = this.normalizeLocations(data);
    this._createTrack();
  }

  static get observedAttributes() {
    return ProtvistaZoomable.observedAttributes.concat([
      "highlight",
      "color",
      "shape"
    ]);
  }

  _getFeatureColor(f) {
    if (f.color) {
      return f.color;
    }
    if (f.feature && f.feature.color) {
      return f.feature.color;
    }
    if (this._color) {
      return this._color;
    }
    if (f.type) {
      return getColorByType(f.type);
    }
    if (f.feature && f.feature.type) {
      return getColorByType(f.feature.type);
    }
    return "black";
  }

  _getFeatureFillColor(f) {
    if (f.fill) {
      return f.fill;
    }
    if (f.feature && f.feature.fill) {
      return f.feature.fill;
    }
    return this._getFeatureColor(f);
  }

  _getShape(f) {
    if (f.shape) {
      return f.shape;
    }
    if (f.feature && f.feature.shape) {
      return f.feature.shape;
    }
    if (this._shape) {
      return this._shape;
    }
    if (f.type) {
      return getShapeByType(f.type);
    }
    if (f.feature && f.feature.type) {
      return getShapeByType(f.feature.type);
    }
    return "rectangle";
  }

  _createTrack() {
    this._layoutObj.init(this._data);

    select(this)
      .selectAll("svg")
      .remove();

    this.svg = select(this)
      .append("div")
      .style("line-height", 0)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this._height);

    this.trackHighlighter.appendHighlightTo(this.svg);

    this.seq_g = this.svg.append("g").attr("class", "sequence-features");

    this._createFeatures();
  }

  _createFeatures() {
    this.featuresG = this.seq_g
      .attr("clip-path", "url(#trackClip)")
      .selectAll("g.feature-group")
      .data(this._data);

    this._clipPath = this.svg
      .append("clipPath")
      .attr("id", "trackClip")
      .append("rect")
      .attr("width", this.getWidthWithMargins())
      .attr("height", this._height);

    this.locations = this.featuresG
      .enter()
      .append("g")
      .attr("class", "feature-group")
      .attr("id", d => `g_${d.accession}`)
      .selectAll("g.location-group")
      .data(d =>
        d.locations.map(loc =>
          Object.assign({}, loc, {
            feature: d
          })
        )
      )
      .enter()
      .append("g")
      .attr("class", "location-group");

    this.features = this.locations
      .selectAll("g.fragment-group")
      .data(d =>
        d.fragments.map(loc =>
          Object.assign({}, loc, {
            feature: d.feature
          })
        )
      )
      .enter()
      .append("path")
      .attr("class", f => `${this._getShape(f)} feature`)
      .attr("d", f =>
        this._featureShape.getFeatureShape(
          this.getSingleBaseWidth(),
          this._layoutObj.getFeatureHeight(f),
          f.end ? f.end - f.start + 1 : 1,
          this._getShape(f)
        )
      )

      .attr(
        "transform",
        f =>
          `translate(${this.getXFromSeqPosition(
            f.start
          )},${this._layoutObj.getFeatureYPos(f.feature)})`
      )
      .attr("fill", f => this._getFeatureFillColor(f))
      .attr("stroke", f => this._getFeatureColor(f))
      .style("fill-opacity", 0.9)
      .call(this.bindEvents, this);
  }

  refresh() {
    if (this.xScale && this.seq_g) {
      this.features = this.seq_g.selectAll("path.feature").data(
        this._data.reduce(
          (acc, f) =>
            acc.concat(
              f.locations.reduce(
                (acc2, e) =>
                  acc2.concat(
                    e.fragments.map(loc =>
                      Object.assign({}, loc, {
                        feature: f
                      })
                    )
                  ),
                []
              )
            ),
          []
        )
      );
      this.features
        .attr("d", f =>
          this._featureShape.getFeatureShape(
            this.getSingleBaseWidth(),
            this._layoutObj.getFeatureHeight(f),
            f.end ? f.end - f.start + 1 : 1,
            this._getShape(f)
          )
        )
        .attr(
          "transform",
          f =>
            `translate(${this.getXFromSeqPosition(
              f.start
            )},${this._layoutObj.getFeatureYPos(f.feature)})`
        );
      this._updateHighlight();
      this._clipPath.attr("width", this.getWidthWithMargins());
    }
  }

  _updateHighlight() {
    this.trackHighlighter.updateHighlight();
  }
}

export default ProtvistaTrack;
export { DefaultLayout };
