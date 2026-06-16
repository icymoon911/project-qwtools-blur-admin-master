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
    // Keep the category context regardless of whether the mail resolves, so the
    // "Back" action always returns to the originating label.
    vm.label = $stateParams.label;
    // Resolve the mail within its label context. An id alone is not a reliable
    // identity here (ids can repeat across labels in the demo data), so the
    // (label, id) pair is what uniquely addresses the clicked record. Returns
    // undefined for unknown ids or ids that do not belong to this label.
    vm.mail = mailMessages.getMessageByLabelAndId($stateParams.label, $stateParams.id);
  }

})();
