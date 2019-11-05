import { scaleLinear } from "d3-scale";
import cloneDeep from "lodash-es/cloneDeep";

const scaleColours = {
  UPDiseaseColor: "#990000",
  UPNonDiseaseColor: "#99cc00",
  deleteriousColor: "#002594",
  benignColor: "#8FE3FF",
  othersColor: "#009e73"
};

const consequences = {
  likelyDisease: [/disease/i, /pathogenic\b/i, /risk factor/i],
  likelyBenign: [/benign/i],
  uncertain: [/uncertain/i, /conflicting/i, /unclassified/i]
};

const significanceMatches = (clinicalSignificance, values) =>
  values.some(rx => rx.test(clinicalSignificance));

const filterData = [
  {
    name: "disease",
    type: {
      name: "consequence",
      text: "Filter Consequence"
    },
    options: {
      labels: ["Likely disease"],
      colors: [scaleColours.UPDiseaseColor]
    }
  },
  {
    name: "predicted",
    type: {
      name: "consequence",
      text: "Filter Consequence"
    },
    options: {
      labels: ["Predicted deleterious", "Predicted benign"],
      colors: [scaleColours.deleteriousColor, scaleColours.benignColor]
    }
  },
  {
    name: "nonDisease",
    type: {
      name: "consequence",
      text: "Filter Consequence"
    },
    options: {
      labels: ["Likely benign"],
      colors: [scaleColours.UPNonDiseaseColor]
    }
  },
  {
    name: "uncertain",
    type: {
      name: "consequence",
      text: "Filter Consequence"
    },
    options: {
      labels: ["Uncertain"],
      colors: [scaleColours.othersColor]
    }
  },
  {
    name: "UniProt",
    type: {
      name: "provenance",
      text: "Filter Provenance"
    },
    options: {
      labels: ["UniProt reviewed"],
      colors: ["#9f9f9f"]
    }
  },
  {
    name: "ClinVar",
    type: {
      name: "provenance",
      text: "Filter Provenance"
    },
    options: {
      labels: ["ClinVar reviewed"],
      colors: ["#9f9f9f"]
    }
  },
  {
    name: "LSS",
    type: {
      name: "provenance",
      text: "Filter Provenance"
    },
    options: {
      labels: ["Large scale studies"],
      colors: ["#9f9f9f"]
    }
  }
];

export const filters = {
  disease: {
    applyFilter: (variants = []) => {
      const clonedVariants = cloneDeep(variants);
      return clonedVariants.filter(variant =>
        significanceMatches(
          variant.clinicalSignificances,
          consequences.likelyDisease
        )
      );
    }
  },
  predicted: {
    applyFilter: (variants = []) => {
      const clonedVariants = cloneDeep(variants);
      return clonedVariants.filter(variant => {
        return (
          typeof variant.polyphenScore !== "undefined" ||
          typeof variant.siftScore !== "undefined"
        );
      });
    }
  },
  nonDisease: {
    applyFilter: variants => {
      const clonedVariants = cloneDeep(variants) || [];
      return clonedVariants.filter(variant =>
        significanceMatches(
          variant.clinicalSignificances,
          consequences.likelyBenign
        )
      );
    }
  },
  uncertain: {
    applyFilter: variants => {
      const clonedVariants = cloneDeep(variants) || [];
      return clonedVariants.filter(
        variant =>
          (typeof variant.clinicalSignificances === "undefined" &&
            typeof variant.polyphenScore === "undefined" &&
            typeof variant.siftScore === "undefined") ||
          significanceMatches(
            variant.clinicalSignificances,
            consequences.uncertain
          )
      );
    }
  },
  UniProt: {
    applyFilter: (variants = []) => {
      const clonedVariants = cloneDeep(variants);
      return clonedVariants.filter(
        variant =>
          variant.xrefNames &&
          (variant.xrefNames.includes("uniprot") ||
            variant.xrefNames.includes("UniProt"))
      );
    }
  },
  ClinVar: {
    applyFilter: (variants = []) => {
      const clonedVariants = cloneDeep(variants);
      return clonedVariants.filter(
        variant =>
          variant.xrefNames &&
          (variant.xrefNames.includes("ClinVar") ||
            variant.xrefNames.includes("clinvar"))
      );
    }
  },
  LSS: {
    applyFilter: (variants = []) => {
      const clonedVariants = cloneDeep(variants) || [];
      return clonedVariants.filter(
        variant =>
          variant.sourceType === "large_scale_study" ||
          variant.sourceType === "mixed"
      );
    }
  }
};

const predictionScale = scaleLinear()
  .domain([0, 1])
  .range([scaleColours.deleteriousColor, scaleColours.benignColor]);

const getPredictionColour = (polyphenScore, siftScore) => {
  return predictionScale(
    (siftScore || 0 + (1 - polyphenScore ? polyphenScore : 1)) /
      (polyphenScore && siftScore ? 2 : 1)
  );
};

export const getColor = variant => {
  if (filters.disease.applyFilter([variant]).length > 0) {
    return scaleColours.UPDiseaseColor;
  }
  if (filters.nonDisease.applyFilter([variant]).length > 0) {
    return scaleColours.UPNonDiseaseColor;
  }
  if (filters.uncertain.applyFilter([variant]).length > 0) {
    return scaleColours.othersColor;
  }
  if (filters.predicted.applyFilter([variant]).length > 0) {
    return getPredictionColour(variant.polyphenScore, variant.siftScore);
  }
  return scaleColours.othersColor;
};

const identity = variants => variants;

export const getFilter = name => {
  const filter = filters[name];
  if (!filter) {
    console.error(`No filter found for: ${name}`);
  }
  return filter || { applyFilter: identity };
};

export default filterData;
