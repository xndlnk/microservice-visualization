module.exports = {
  template: {
    commit: function (placeholders) {
      return '- [' + placeholders.message + '](' + placeholders.url + ')';
    }
  }
}