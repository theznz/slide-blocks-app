
class Component extends DCLogic {
  renderVals() {
    return {
      retry: function () {
        if (navigator.onLine !== false) {
          var t = App.data.pendingOfflineTarget || 'Main';
          App.data.pendingOfflineTarget = null;
          window.go(t);
        } else {
          App.toast('Hâlâ bağlantı yok');
        }
      }
    };
  }
}
