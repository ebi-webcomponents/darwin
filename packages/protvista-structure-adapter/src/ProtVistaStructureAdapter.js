import ProtvistaFeatureAdapter from "protvista-feature-adapter";
import { v1 } from "uuid";
import {
  getAllFeatureStructures,
  mergeOverlappingIntervals,
  formatTooltip
} from "./StructureDataParser";

export const transformData = data => {
  let transformedData = [];
  if (data && data.length !== 0) {
    const allFeatureStructures = getAllFeatureStructures(data);
    transformedData = mergeOverlappingIntervals(allFeatureStructures);

    transformedData.forEach(feature => {
      /* eslint-disable no-param-reassign */
      feature.tooltipContent = formatTooltip(feature);
      feature.protvistaFeatureId = v1();
    });
  }
  return transformedData;
};

export default class ProtVistaStructureAdapter extends ProtvistaFeatureAdapter {
  parseEntry(data) {
    this._adaptedData = transformData(data);
    return this._adaptedData;
  }
}
