
class Component extends DCLogic {
  renderVals() {
    var ICON = {
      check: 'M5 12l5 5 9-10',
      star: 'M12 2.500l2.900 6.200 6.600.8-4.900 4.600 1.300 6.600L12 17.400l-5.900 3.300 1.300-6.600-4.900-4.600 6.600-.8z',
      bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
      bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z',
      flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
      flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
      crown: 'M4 18h16M4 18L3 8l5 4 4-7 4 7 5-4-1 10',
      palette: 'M12 3a9 9 0 1 0 0 18c1.500 0 2-1 2-2s-.5-1.500.5-2.500 4.500.5 5.500-2.500C21.500 8 17.500 3 12 3z',
      cal: 'M5 6h14v15H5zM5 11h14M9 3v4M15 3v4'
    };
    var COLORS = ['#3DD6C3', '#FFD35C', '#6C8CFF', '#FF7AA8', '#FF9F45'];
    var defs = App.computeBadges();
    var earnedCount = defs.filter(function (b) { return b.earned; }).length;
    var badges = defs.map(function (b, i) {
      var accent = COLORS[i % COLORS.length];
      return {
        name: b.name, how: b.how, icon: ICON[b.icon] || ICON.check,
        bg: b.earned ? accent : 'transparent',
        shadow: b.earned ? 'inset 0 -5px 0 rgba(0,0,0,0.25)' : 'none',
        border: b.earned ? '0' : '2px solid #3A4080',
        pad: b.earned ? '5px' : '0',
        fg: b.earned ? '#171A36' : '#8D93C9',
        status: b.earned ? 'Kazanıldı' : b.status,
        statusFg: b.earned ? '#3DD6C3' : '#FFD35C'
      };
    });
    return { badges: badges, earnedCount: earnedCount, total: defs.length };
  }
}
