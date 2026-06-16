/**
 * @author a.demeshko
 * created on 28.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.components.mail')
    .controller('MailDetailCtrl', MailDetailCtrl);

  /** @ngInject */
  function MailDetailCtrl($stateParams, mailMessages) {
    var vm = this;
    // Keep the originating category from the URL no matter what, so "Back" always
    // returns to the right label even when the requested message can't be resolved.
    vm.label = $stateParams.label;
    // Resolve the message inside its category context (see mailMessages.getMessage),
    // so a duplicate id, a missing id, or an id from another label can't show the
    // wrong mail or a half-broken page.
    vm.mail = mailMessages.getMessage($stateParams.label, $stateParams.id);
  }

})();
