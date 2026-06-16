/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.dashboard')
      .controller('DashboardTodoCtrl', DashboardTodoCtrl);

  /** @ngInject */
  function DashboardTodoCtrl($scope, baConfig) {

    var STORAGE_KEY = 'BlurAdmin.dashboard.todoList';
    var MAX_TEXT_LENGTH = 200;

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

    // ---- persistence -------------------------------------------------------

    // Normalize an arbitrary stored/seed entry into a valid todo item.
    // Returns null for entries that should never live in the list (blank text,
    // or legacy soft-deleted rows) so invalid data never reaches the view.
    function normalizeItem(raw) {
      if (!raw || raw.deleted) {
        return null;
      }
      var text = typeof raw.text === 'string' ? raw.text.trim() : '';
      if (!text) {
        return null;
      }
      return {
        text: text,
        color: raw.color || getRandomColor(),
        done: !!raw.done,
      };
    }

    function normalizeList(list) {
      var result = [];
      if (!angular.isArray(list)) {
        return result;
      }
      list.forEach(function (raw) {
        var item = normalizeItem(raw);
        if (item) {
          result.push(item);
        }
      });
      return result;
    }

    function loadTodos() {
      var stored = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        stored = null;
      }

      // First ever visit (no key at all): seed the demo list and persist it so
      // every later visit is stable. A stored-but-empty list is respected.
      if (stored === null) {
        var seeded = normalizeList(defaultTodoList);
        saveTodos(seeded);
        return seeded;
      }

      try {
        return normalizeList(JSON.parse(stored));
      } catch (e) {
        return normalizeList(defaultTodoList);
      }
    }

    function saveTodos(list) {
      var toSave = list || $scope.todoList;
      try {
        window.localStorage.setItem(STORAGE_KEY, angular.toJson(toSave));
      } catch (e) {
        // Storage unavailable (private mode / quota): keep working in-memory.
      }
    }

    $scope.todoList = loadTodos();

    // Persist after the checkbox toggles done, after drag reordering, etc.
    $scope.todoChanged = function () {
      saveTodos();
    };

    // ---- adding ------------------------------------------------------------

    $scope.newTodoText = '';

    $scope.addToDoItem = function (event, clickPlus) {
      if (!clickPlus && !(event && event.which === 13)) {
        return;
      }

      var text = ($scope.newTodoText || '').trim();
      // Reject empty / whitespace-only input so the list never gets blank rows.
      if (!text) {
        $scope.newTodoText = '';
        return;
      }
      if (text.length > MAX_TEXT_LENGTH) {
        text = text.substring(0, MAX_TEXT_LENGTH);
      }

      $scope.todoList.unshift({
        text: text,
        color: getRandomColor(),
        done: false,
      });
      $scope.newTodoText = '';
      saveTodos();
    };

    // ---- removing ----------------------------------------------------------

    $scope.removeItem = function (item) {
      var index = $scope.todoList.indexOf(item);
      if (index !== -1) {
        $scope.todoList.splice(index, 1);
        saveTodos();
      }
    };

    $scope.clearCompleted = function () {
      $scope.todoList = $scope.todoList.filter(function (item) {
        return !item.done;
      });
      saveTodos();
    };

    // ---- focus on unfinished tasks ----------------------------------------

    $scope.filter = 'all';

    $scope.setFilter = function (filter) {
      $scope.filter = filter;
      // Reordering is only meaningful (and index-safe) when the whole list is
      // shown, so disable drag sorting while a sub-set is filtered.
      $scope.sortableOptions.disabled = filter !== 'all';
    };

    // Predicate used by the ng-repeat filter to show all / active / done items.
    $scope.todoFilter = function (item) {
      if ($scope.filter === 'active') {
        return !item.done;
      }
      if ($scope.filter === 'done') {
        return !!item.done;
      }
      return true;
    };

    $scope.remainingCount = function () {
      return $scope.todoList.filter(function (item) {
        return !item.done;
      }).length;
    };

    $scope.completedCount = function () {
      return $scope.todoList.length - $scope.remainingCount();
    };

    // ---- drag sorting ------------------------------------------------------

    // angular-ui-sortable mutates todoList in place on drop; persist the new
    // order once the drag settles.
    $scope.sortableOptions = {
      disabled: false,
      stop: function () {
        saveTodos();
      },
    };
  }
})();
