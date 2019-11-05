export default class ParserHelper {
  static capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  static getDescription(properties) {
    return Object.keys(properties).reduce(
      (accumulator, propertyKey) =>
        `${accumulator}${ParserHelper.capitalizeFirstLetter(propertyKey)}: ${
          properties[propertyKey]
        }. `,
      ""
    );
  }

  static getBeginEnd(value) {
    const posEqual = value.indexOf("=");
    const posDash = value.indexOf("-");
    if (posEqual === -1 || posDash === -1) {
      return { begin: 0, end: 0 };
    }
    return {
      begin: +value.slice(posEqual + 1, posDash),
      end: +value.slice(posDash + 1)
    };
  }
}
