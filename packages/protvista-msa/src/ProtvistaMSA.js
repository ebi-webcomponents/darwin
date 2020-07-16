import ProtvistaZoomable from "protvista-zoomable";
import ReactMSAViewer from "react-msa-viewer";
import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { select } from "d3";

// This component is used internally to create a clickable
// label inside ProtvistaMSA
const TrackLabel = (sequence, activeLabel, setActiveTrack) => {
  const labelStyle = {
    height: 20,
    fontWeight: "normal",
    fontSize: "14px",
    cursor: "pointer",
    display: "block",
    padding: "0 0.5rem",
    borderLeft: "0.2rem solid transparent",
    boxSizing: "content-box",
    color: "#00639A",
    textTransform: "uppercase",
  };

  const activeLabelStyle = {
    ...labelStyle,
    fontWeight: "bold",
    borderLeft: "0.2rem solid #00639A",
  };

  const labelRef = useRef(null);
  useEffect(() => {
    labelRef.current.addEventListener("click", () =>
      setActiveTrack(sequence.name)
    );
  }, [labelRef]);

  return (
    <span
      style={sequence.name === activeLabel ? activeLabelStyle : labelStyle}
      ref={labelRef}
    >
      {sequence.name}
    </span>
  );
};

class ProtvistaMSA extends ProtvistaZoomable {
  constructor() {
    super();
    this.setActiveTrack = this.setActiveTrack.bind(this);
  }

  static get properties() {
    return {
      onActiveTrackChange: { type: Function },
      onFeatureClick: { type: Function },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.hasAttribute("activeLabel")) {
      this.activeLabel = this.getAttribute("activeLabel");
    }
  }

  static get observedAttributes() {
    return ProtvistaZoomable.observedAttributes.concat([
      "labelwidth",
      "activeLabel",
      "colorscheme",
      "calculateConservation",
      "features",
    ]);
  }

  get activeLabel() {
    return this.getAttribute("activeLabel");
  }

  set activeLabel(value) {
    this.setAttribute("activeLabel", value);
  }

  setActiveTrack(newValue) {
    this.setAttribute("activeLabel", newValue);

    if (this.onActiveTrackChange) {
      this.onActiveTrackChange(newValue);
    }

    this.refresh();
  }

  set data(_data) {
    this._data = _data;
    this.refresh();
    window.requestAnimationFrame(() => {
      this.svg = select(this).select("div");
    });
  }

  set features(_features) {
    this._features = _features;
    this.refresh();
  }

  // eslint-disable-next-line class-methods-use-this
  get margin() {
    return {
      top: 10,
      right: 0,
      bottom: 10,
      left: this._labelwidth || 10,
    };
  }
  getColorMap() {
    return this.el.getColorMap();
  }

  handleFeatureClick(id) {
    this.onFeatureClick(id);
  }

  refresh() {
    if (!this.activeLabel && this._data && this._data[0]) {
      this.setActiveTrack(this._data[0].name);
    }
    const options = {
      sequences: this._data,
      height: this._height,
      width: this.width - (this._labelwidth || 0),
      tileHeight: 20,
      tileWidth: Math.max(1, this.getSingleBaseWidth()),
      colorScheme: this._colorscheme || "clustal",
      layout: "nightingale",
      sequenceOverflow: "scroll",
      sequenceOverflowX: "overflow",
      sequenceDisableDragging: true,
      labelComponent: ({ sequence }) =>
        TrackLabel(sequence, this.activeLabel, this.setActiveTrack),
      onFeatureClick: (id) => this.handleFeatureClick(id),
      features: this._features,
    };

    if (this.hasAttribute("calculate-conservation")) {
      options.calculateConservation = true;
    }
    if (this._labelwidth) {
      options.labelStyle = {
        width: this._labelwidth - 5,
        "text-align": "end",
        "padding-right": 5,
        overflow: "hidden",
      };
    }
    ReactDOM.render(
      <ReactMSAViewer {...options} ref={(ref) => (this.el = ref)} />,
      this
    );
    window.requestAnimationFrame(() => {
      if (this.el) {
        this.el.updatePositionByResidue({ aaPos: this._displaystart });
        if (1 > this.getSingleBaseWidth()) {
          this.dispatchEvent(
            // Dispatches the event so the manager can propagate this changes to other  components
            new CustomEvent("change", {
              detail: {
                displaystart: this._displaystart,
                displayend: this._displaystart + this.xScale.range()[1],
              },
              bubbles: true,
              cancelable: true,
            })
          );
        }
        // if (
        //   this.trackHighlighter &&
        //   this.trackHighlighter.region &&
        //   this.trackHighlighter.region.regionString
        // ) {
        //   const {
        //     start: from,
        //     end: to
        //   } = this.trackHighlighter.region.segments[0];
        //   this.el.highlightRegion({
        //     sequences: {
        //       from: 1,
        //       to: this._data.length
        //     },
        //     residues: {
        //       from,
        //       to
        //     }
        //   });
        // }
      }
    });
  }
}

export default ProtvistaMSA;
