export default class Formatters {
  static walletAddress(str) {
    if (str.length > 20) {
      if (window.innerWidth > 768) {
        return (
          str.substring(0, 6) +
          "..." +
          str.substring(str.length - 6, str.length)
        );
      } else {
        return (
          str.substring(0, 5) +
          "..." +
          str.substring(str.length - 5, str.length)
        );
      }
    }
    return str;
  }

  static historyAmount(amount) {
    let str = amount.toString();
    if (str.length > 10) {
      return (
        str.substring(0, 3) + "..." + str.substring(str.length - 3, str.length)
      );
    } else {
      return str;
    }
  }
}
