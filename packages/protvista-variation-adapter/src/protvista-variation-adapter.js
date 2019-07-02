import groupBy from "lodash-es/groupBy";
import flatten from "lodash-es/flatten";
import uniqBy from "lodash-es/uniqBy";
import forOwn from "lodash-es/forOwn";
import intersectionBy from "lodash-es/intersectionBy";

import ProtvistaFeatureAdapter from "protvista-feature-adapter";
import filters, { getFilter, getColor } from "./filters";

const filterVariants = (filterName, variants) =>
  getFilter(filterName).applyFilter(variants);

const _union = (variants, filterNames, key) => {
  return uniqBy(
    flatten(
      filterNames
        .map(name => name.split(":")[1])
        .map(name => filterVariants(name, variants))
    ),
    v => v[key]
  );
};

export default class ProtvistaVariationAdapter extends ProtvistaFeatureAdapter {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["activefilters"];
  }

  get isManaged() {
    return true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name !== "activefilters") {
        return;
      }
      const { sequence, variants } = this._adaptedData;
      newValue = newValue.trim();
      if (!newValue) {
        this._fireEvent("load", { payload: { sequence, variants } });
        return;
      }
      const filterNames = newValue.split(",");
      const groupByFilterCategory = groupBy(filterNames, name => {
        return name.split(":")[0];
      });

      let filteredVariants = [];
      forOwn(groupByFilterCategory, filterNames => {
        const filteredValuesByCategory = _union(
          variants,
          filterNames,
          "accession"
        );
        filteredVariants.push(filteredValuesByCategory);
      });
      filteredVariants = flatten(
        intersectionBy(...filteredVariants, variant => variant.accession)
      );

      filteredVariants = uniqBy(filteredVariants, "accession");
      this._fireEvent("load", {
        payload: { sequence, variants: filteredVariants }
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._fireEvent("change", {
      type: "filters",
      value: JSON.stringify(filters)
    });
  }

  parseEntry(data) {
    const { sequence, features } = data;
    if (!sequence) return;

    const variants = features.map(variant => {
      return {
        accession: variant.genomicLocation,
        variant: variant.alternativeSequence,
        start: variant.begin,
        end: variant.end,
        tooltipContent: this.formatTooltip(variant),
        color: getColor(variant),
        association: variant.association,
        sourceType: variant.sourceType,
        xrefNames: this.getSourceType(variant.xrefs, variant.sourceType),
        clinicalSignificances: variant.clinicalSignificances,
        polyphenScore: variant.polyphenScore,
        siftScore: variant.siftScore
      };
    });

    this._adaptedData = { sequence, variants };
  }

  getSourceType(xrefs, sourceType) {
    const xrefNames = xrefs.map(ref => ref.name);
    if (sourceType === "uniprot" || sourceType === "mixed") {
      xrefNames.push("uniprot");
    }
    return xrefNames;
  }

  formatTooltip(variant) {
    // Need to inherit from protvista-feature-adapter
    // const evidenceHTML = ParserHelper.getEvidenceFromCodes(feature.evidences);
    const evidenceHTML = "";
    if (variant.description)
      variant.descriptionArray = this.getDescriptionsAsArray(
        variant.description
      );
    return `
            <table>
                <tr><td>Variant</td><td>${variant.wildType} > ${
      variant.alternativeSequence
    }</td></tr>
                ${
                  variant.frequency
                    ? `<tr><td>Frequency (MAF)</td><td>${
                        variant.frequency
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.siftScore
                    ? `<tr><td>SIFT</td><td>${variant.siftPrediction} ${
                        variant.siftScore
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.polyphenScore
                    ? `<tr><td>Polyphen</td><td>${variant.polyphenPrediction} ${
                        variant.polyphenScore
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.consequenceType
                    ? `<tr><td>Consequence</td><td>${
                        variant.consequenceType
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.somaticStatus
                    ? `<tr><td>Somatic</td><td>${
                        variant.somaticStatus === 0 ? "No" : "Yes"
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.genomicLocation
                    ? `<tr><td>Location</td><td>${
                        variant.genomicLocation
                      }</td></tr>`
                    : ``
                }
                ${
                  variant.sourceType === "UniProt" ||
                  variant.sourceType === "mixed"
                    ? this.getUniProtHTML(variant)
                    : ""
                }
                ${
                  variant.sourceType === "large_scale_study" ||
                  variant.sourceType === "mixed"
                    ? this.getLSSHTML(variant)
                    : ""
                }
            </table>
        `;
  }

  getUniProtHTML(variant) {
    return `<tr><td colspan="2"><h4>UniProt</h4></td></tr>
        ${
          variant.descriptionArray && variant.descriptionArray.UP
            ? `<tr><td>Description</td><td>${variant.descriptionArray.UP.join(
                "; "
              )}</td></tr>`
            : ``
        }
        ${
          variant.ftId
            ? `<tr><td>Feature ID</td><td>${variant.ftId}</td></tr>`
            : ``
        }
        ${
          variant.association
            ? `<tr><td colspan="2"><h5>Disease association</h5></td></tr>
            ${this.getDiseaseAssociations(variant.association)}`
            : ""
        }
        `;
  }

  getLSSHTML(variant) {
    return `<tr><td colspan="2"><h4>Large scale studies</h4></td></tr>
        ${
          variant.descriptionArray && variant.descriptionArray.LSS
            ? `<tr><td>Description</td><td>${
                variant.descriptionArray.LSS
              }</td></tr>`
            : ``
        }
        ${
          variant.frequency
            ? `<tr><td>Frequency (MAF)</td><td>${variant.frequency}</td></tr>`
            : ``
        }
        <tr><td>Cross-references</td><td>${this.getXrefs(
          variant.xrefs
        )}</td></tr>
        `;
  }

  getXrefs(xrefs) {
    return xrefs
      .map(d => `<a href="${d.url}">${d.id}</a> (${d.name})`)
      .join("<br>");
  }

  getDiseaseAssociations(associations) {
    return associations.map(
      association => `
            <tr><td>Disease</td><td>${association.name}</td></tr>
            ${
              association.xrefs
                ? `<tr><td>Cross-references</td><td>${this.getXrefs(
                    association.xrefs
                  )}</td></tr>`
                : ""
            }
            ${this.getEvidenceFromCodes(association.evidences)}
        `
    );
  }

  //TODO this should be inherited from ParserHelper
  getEvidenceFromCodes(evidences) {
    return (
      evidences &&
      evidences.map(
        evidence => `
            <tr><td>Evidence</td><td>${evidence.code}</td></tr>
            <tr><td>Source</td><td><a href="${evidence.source.url}">${
          evidence.source.id
        }</a> (${evidence.source.name})</td></tr>
        `
      )
    );
  }

  _fireEvent(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: detail,
        bubbles: true,
        cancelable: true
      })
    );
  }

  //TODO this is horrible. Jie is looking into changing the API so Xrefs
  //have a description attribute, so we won't have to use concat.
  getDescriptionsAsArray(description) {
    var descriptionArray = description.split(/\[LSS_|\[SWP]: /g);
    descriptionArray = groupBy(descriptionArray, function(desc) {
      return desc.length === 0
        ? "NOTHING"
        : desc.indexOf("]: ") !== -1
        ? "LSS"
        : "UP";
    });
    // descriptionArray.UP = descriptionArray.UP ? descriptionArray.UP.join('; ') : undefined;
    descriptionArray.LSS = descriptionArray.LSS
      ? descriptionArray.LSS.join("; ").replace(/]: /g, ": ")
      : undefined;
    return descriptionArray;
    // if (Evidence.existAssociation(data.association)) {
    //     _.each(data.association, function(association) {
    //         if (association.description) {
    //             var index = association.description.indexOf('Ftid: ');
    //             if (index !== -1) {
    //                 data.ftId = association.description.substr(index + 6, 10);
    //                 association.description = (association.description.slice(0, index) +
    //                     association.description.slice(index + 16)).trim();
    //             }
    //         }
    //     });
    // }
  }
}
