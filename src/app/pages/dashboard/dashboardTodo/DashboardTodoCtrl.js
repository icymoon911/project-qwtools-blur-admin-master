/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.dashboard')
      .controller('DashboardTodoCtrl', DashboardTodoCtrl);

  /** @ngInject */
  function DashboardTodoCtrl($scope, $window, $timeout, baConfig) {

    var STORAGE_KEY = 'BlurAdmin.dashboard.todoList';

    $scope.transparent = baConfig.theme.blur;
    var dashboardColors = baConfig.colors.dashboard;
    var colors = [];
    for (var key in dashboardColors) {
      colors.push(dashboardColors[key]);
    }

    function getRandomColor() {
      var i = Math.floor(Math.random() * (colors.length - 1));
      return colors[i];
    }

    // Initial demo content, only used the very first time (no saved data yet).
    var defaultTodoList = [
      { text: 'Check me out' },
      { text: 'Lorem ipsum dolor sit amet, possit denique oportere at his, etiam corpora deseruisse te pro' },
      { text: 'Ex has semper alterum, expetenda dignissim' },
      { text: 'Vim an eius ocurreret abhorreant, id nam aeque persius ornatus.' },
      { text: 'Simul erroribus ad usu' },
      { text: 'Ei cum solet appareat, ex est graeci mediocritatem' },
      { text: 'Get in touch with akveo team' },
      { text: 'Write email to business cat' },
      { text: 'Have fun with blur admin' },
      { text: 'What do you think?' },
    ];

    // --- persistence -------------------------------------------------------

    // Returns a sanitized list when saved data exists (even an empty list,
    // so an intentionally emptied list is not re-seeded), or null when the
    // todo card has never been used / the stored value is unusable.
    function load() {
      try {
        var raw = $window.localStorage.getItem(STORAGE_KEY);
        if (raw === null || raw === undefined) {
          return null;
        }
        var parsed = angular.fromJson(raw);
        if (!angular.isArray(parsed)) {
          return null;
        }
        return sanitize(parsed);
      } catch (e) {
        // Corrupt JSON or storage access denied -> fall back to a fresh seed.
        return null;
      }
    }

    // Normalizes stored/legacy items: trims text, drops blanks and the old
    // soft-deleted entries, guarantees a color and a boolean done flag.
    function sanitize(list) {
      var result = [];
      list.forEach(function (item) {
        if (!item || item.deleted) {
          return;
        }
        var text = (typeof item.text === 'string') ? item.text.trim() : '';
        if (!text) {
          return;
        }
        result.push({
          text: text,
          color: item.color || getRandomColor(),
          done: !!item.done
        });
      });
      return result;
    }

    function save() {
      try {
        $window.localStorage.setItem(STORAGE_KEY, angular.toJson($scope.todoList));
      } catch (e) {
        // Storage unavailable (private mode / quota exceeded): keep the card
        // usable for this session instead of breaking the page.
      }
    }

    function seed() {
      return defaultTodoList.map(function (item) {
        return { text: item.text, color: getRandomColor(), done: false };
      });
    }

    var stored = load();
    if (stored === null) {
      $scope.todoList = seed();
      save();
    } else {
      $scope.todoList = stored;
    }

    // --- view state --------------------------------------------------------

    $scope.newTodoText = '';
    $scope.filter = 'all'; // 'all' | 'active' | 'completed'

    $scope.sortableOptions = {
      disabled: false,
      // jQuery UI fires `stop` after angular-ui-sortable has already applied
      // the new order to todoList, so persisting here keeps the saved order
      // in sync with the dropped order.
      stop: function () {
        $timeout(save);
      }
    };

    // --- actions -----------------------------------------------------------

    $scope.addToDoItem = function (event, clickPlus) {
      if (!clickPlus && (!event || event.which !== 13)) {
        return;
      }
      var text = ($scope.newTodoText || '').trim();
      // Reject empty / whitespace-only input so the list never holds blanks.
      if (!text) {
        $scope.newTodoText = '';
        return;
      }
      $scope.todoList.unshift({
        text: text,
        color: getRandomColor(),
        done: false
      });
      $scope.newTodoText = '';
      save();
    };

    $scope.toggleDone = function () {
      save();
    };

    $scope.removeItem = function (item) {
      var index = $scope.todoList.indexOf(item);
      if (index !== -1) {
        $scope.todoList.splice(index, 1);
        save();
      }
    };

    $scope.setFilter = function (filter) {
      $scope.filter = filter;
      // Reordering only maps cleanly onto the full array, so dragging is
      // limited to the "all" view to avoid scrambling the hidden items.
      $scope.sortableOptions.disabled = (filter !== 'all');
    };

    $scope.isVisible = function (item) {
      if ($scope.filter === 'active') {
        return !item.done;
      }
      if ($scope.filter === 'completed') {
        return !!item.done;
      }
      return true;
    };

    $scope.remainingCount = function () {
      var count = 0;
      $scope.todoList.forEach(function (item) {
        if (!item.done) {
          count++;
        }
      });
      return count;
    };

    $scope.visibleCount = function () {
      var count = 0;
      $scope.todoList.forEach(function (item) {
        if ($scope.isVisible(item)) {
          count++;
        }
      });
      return count;
    };
  }
})();
