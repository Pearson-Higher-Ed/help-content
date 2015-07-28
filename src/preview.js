(function (window, undefined) {

  var HelpContent = (function () {

    var BASE_URL = localStorage.getItem('BASE_URL');
    if (typeof BASE_URL === 'undefined' || BASE_URL === null) {
      BASE_URL = 'https://raw.githubusercontent.com/Pearson-Higher-Ed/help-content/poc';
    }

    function HelpContent() {

    }

    HelpContent.prototype.fetch = function (context) {
      context = context || {};
      if (typeof context === 'string') context = hrefToContext(context);

      var path = getPath(context);
      var url = BASE_URL + path;
      var request = new Request(url);

      return fetch(request)
        .then(function (response) {
          if (!response.ok) return generateAlertHtml('error', 'Failed to fetch data.');

          return response.text();
        })
        .catch(function () {
          return generateAlertHtml('error', 'Failed to fetch data.');
        });
    };

    function hrefToContext(href) {
      var context = {};

      if (href[0] === '/') href = href.slice(1);
      href = href.split('/');
      context.product = href[0];
      context.view = href[1];
      context.role = href[2];
      context.article = href[3];

      return context;
    }

    function getPath(context) {
      var path = '/docs';

      if (context.product) path += '/' + context.product;
      if (context.view) path += '/' + context.view;
      if (context.role) path += '/' + context.role;
      path += (context.article ? '/' + context.article + '.html' : '/index.html');

      return path;
    }

    function generateAlertHtml(type, message) {
      return '<div class="alert alert-' + type + '">' + message + '</div>';
    }

    return HelpContent;

  })();

  var App = (function () {

    function App() {
      this.helpContent = new HelpContent();
      this.indexEl = document.body.querySelector('.index');
      this.detailEl = document.body.querySelector('.detail');
    }

    App.prototype.boot = function () {
      var app = this;

      document.body.addEventListener('click', function (e) {
        if (e.target.hasAttribute('data-help')) {
          app.handleHelpLinkClick_(e);
        }
      });

      this.helpContent.fetch().then(this.setIndex.bind(this));
      this.boot = noop;
    };

    App.prototype.setIndex = function (html) {
      this.indexEl.innerHTML = html;
    };

    App.prototype.setDetail = function (html) {
      this.detailEl.innerHTML = html;
    };

    App.prototype.handleHelpLinkClick_ = function (e) {
      e.preventDefault();

      if (e.target.getAttribute('data-help') === 'list') {
        this.helpContent.fetch(e.target.getAttribute('href')).then(this.setIndex.bind(this));
      } else {
        this.helpContent.fetch(e.target.getAttribute('href')).then(this.setDetail.bind(this));
      }
    };

    function noop() {}

    return App;

  })();

  function main() {
    document.addEventListener('DOMContentLoaded', function () {
      (new App()).boot();
    });
  }

  main();

})(this);
