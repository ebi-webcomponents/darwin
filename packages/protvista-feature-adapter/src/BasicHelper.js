import { ecoMap } from "./evidences";

export default class BasicHelper {
  static renameProperties(features) {
    features.forEach(ft => {
      if (ft.begin) {
        ft.start = ft.begin;
        delete ft.begin;
      }
    });
    return features;
  }

  static formatSource(source) {
    return source.name === "PubMed"
      ? ` <a href='${source.url}' style="color:#FFF" target='_blank'>${
          source.name
        }</a> <a href='${
          source.alternativeUrl
        }' style="color:#FFF" target='_blank'>EuropePMC</a>`
      : ` <a href='${source.url}' style="color:#FFF" target='_blank'>${
          source.id
        }</a> (${source.name})`;
  }

  static getEvidenceFromCodes(evidenceList) {
    if (!evidenceList) return;
    return `
      <ul>${evidenceList
        .map(ev => {
          const ecoMatch = ecoMap.find(eco => eco.name === ev.code);
          if (!ecoMatch) return;
          return `<li title='${
            ecoMatch.description
          }' style="padding: .25rem 0">${ecoMatch.shortDescription}: ${
            ev.source ? BasicHelper.formatSource(ev.source) : ""
          }</li>`;
        })
        .join("")}</ul>
    `;
  }

  static formatXrefs(xrefs) {
    return `<ul>${xrefs
      .map(
        xref =>
          `<li style="padding: .25rem 0">${xref.name} <a href="${
            xref.url
          }" style="color:#FFF" target="_blank">${xref.id}</a></li>`
      )
      .join("")}</ul>`;
  }

  static formatTooltip(feature) {
    const evidenceHTML = BasicHelper.getEvidenceFromCodes(feature.evidences);
    return `
      ${
        feature.description
          ? `<h5>Description</h5><p>${feature.description}</p>`
          : ``
      }
      ${
        feature.matchScore
          ? `<h5>Match score</h5><p>${feature.matchScore}%</p>`
          : ``
      }
      ${feature.ftId ? `<h5>Feature ID</h5><p>${feature.ftId}</p>` : ``}
      ${
        feature.alternativeSequence
          ? `<h5>Alternative sequence</h5><p>${feature.alternativeSequence}</p>`
          : ``
      }
      ${evidenceHTML ? `<h5>Evidence</h5>${evidenceHTML}` : ``}
      ${
        feature.xrefs
          ? `<h5>Cross-references</h5>${BasicHelper.formatXrefs(feature.xrefs)}`
          : ""
      }
        `;
  }
}
