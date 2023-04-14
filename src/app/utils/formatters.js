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
}

