// ---- localization: source strings are Turkish; other languages map Turkish text -> translation ----
// Markup text and aria-labels are translated by the engine before {{ }} holes are filled,
// so a key may contain holes, e.g. 'Seviye {{ levelIndex }}'. Strings built in code use
// App.t('… {n} …', { n: 3 }).
(function (App) {
  App.LANGS = [
    { id: 'tr', name: 'Türkçe' }, { id: 'en', name: 'English' }, { id: 'de', name: 'Deutsch' }, { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' }, { id: 'it', name: 'Italiano' }, { id: 'pt', name: 'Português' }, { id: 'ru', name: 'Русский' }
  ];

  var DICT = {
    en: {
      // common
      'Geri': 'Back', 'Ayarlar': 'Settings', 'Seviyeler': 'Levels', 'Ana ekran': 'Home', 'Rozetler': 'Badges',
      'Profil': 'Profile', 'Temalar': 'Themes', 'Sıralama': 'Leaderboard', 'Günlük': 'Daily', 'Avatar': 'Avatar',
      'Vazgeç': 'Cancel', 'Hamle': 'Moves', 'Hedef': 'Target', 'Süre': 'Time', 'İpucu': 'Hint',
      'Seviye {{ levelIndex }}': 'Level {{ levelIndex }}',
      'Yetersiz yıldız': 'Not enough stars', '{n} yıldız': '{n} stars', 'İzleniyor…': 'Watching…',
      '+1 ipucu kazandın': 'You earned +1 hint', '{tier} paket': '{tier} pack',
      // tiers
      'Kolay': 'Easy', 'Orta': 'Medium', 'Zor': 'Hard', 'Uzman': 'Expert',
      // themes
      'Şeker': 'Candy', 'Ahşap': 'Wood', 'Neon': 'Neon', 'Pastel': 'Pastel', 'Okyanus': 'Ocean', 'Gece': 'Night', 'Balon': 'Balloon', 'Şekerleme': 'Gummy', 'Jöle': 'Jelly', 'Cam': 'Glass', 'Metalik': 'Metallic',

      // levels v2
      'Efsane': 'Legend',
      'Oklu bloğu çıkışa ulaştır': 'Get the arrow block to the exit',
      'Oklu bloğun yolunu kapatan blokları kenara çek. Gri duvarlar hiç kımıldamaz.': 'Move aside the blocks in the arrow block’s way. Grey walls never move.',
      'Oklu bloğu okun gösterdiği çıkışa ulaştır. Çıkış her kenarda olabilir; ne kadar az hamle, o kadar çok yıldız.': 'Get the arrow block to the exit it points at. The exit can be on any side; the fewer moves, the more stars.',
      'Bu sefer çıkış solda!': 'This time the exit is on the left!',
      'Bu sefer çıkış yukarıda!': 'This time the exit is at the top!',
      'Bu sefer çıkış aşağıda!': 'This time the exit is at the bottom!',
      'Yeni: Gri duvarlar hiç kımıldamaz!': 'New: grey walls never move!',

      // reminders + Tüy theme
      'Günlük bulmacan seni bekliyor!': 'Your daily puzzle is waiting!',
      'Günlük bulmacan seni bekliyor! Seriyi bozma.': 'Your daily puzzle is waiting! Keep your streak going.',
      'Bildirim izni verilmedi; hatırlatma uygulama içinde gösterilecek.': 'Notifications weren’t allowed; reminders will show inside the app.',
      'Bu tarayıcı bildirimleri desteklemiyor; hatırlatma uygulama içinde gösterilecek.': 'This browser doesn’t support notifications; reminders will show inside the app.',

      // Splash
      'Yükleniyor…': 'Loading…', 'Ana ekrana geç': 'Go to home',

      // Onboarding
      'Nasıl oynanır?': 'How to play?', 'Geç': 'Skip',
      'Blokları parmağınla sürükle. Yatay bloklar sağa sola, dikey bloklar yukarı aşağı kayar.': 'Drag the blocks with your finger. Horizontal blocks slide left and right, vertical blocks slide up and down.',
      'Anladım, başla': 'Got it, let’s go',

      // Login
      'İlerlemeni kaydet': 'Save your progress',
      'Giriş yaparsan yıldızların, temaların ve avatarın tüm cihazlarında seninle gelir.': 'Sign in and your stars, themes and avatar follow you to all your devices.',
      'Apple ile Devam Et': 'Continue with Apple', 'Google ile Devam Et': 'Continue with Google',
      'E-posta ile Devam Et': 'Continue with email', 'Misafir Olarak Devam Et': 'Continue as guest',
      "Devam ederek Kullanım Koşulları'nı ve Gizlilik Politikası'nı kabul etmiş olursun.": 'By continuing you accept the Terms of Use and Privacy Policy.',
      'Bu özellik çevrimdışı sürümde yok. Misafir olarak devam edebilirsin.': 'This feature isn’t available in the offline version. You can continue as a guest.',

      // Main
      'mağazayı aç': 'open shop', 'Oyna': 'Play',
      'Seviye {{ unlockedLevel }} · {{ tierName }}': 'Level {{ unlockedLevel }} · {{ tierName }}',

      // Game
      'Seviyelere dön': 'Back to levels', 'Sesi aç/kapat': 'Sound on/off', 'Duraklat': 'Pause',
      'Geri al': 'Undo', 'Yeniden': 'Restart',
      'Geri alınacak hamle yok': 'No moves to undo', 'Şu an ipucu bulunamadı': 'Couldn’t find a hint right now',
      'Bu bloğu sağa kaydır': 'Slide this block right', 'Bu bloğu sola kaydır': 'Slide this block left',
      'Bu bloğu aşağı kaydır': 'Slide this block down', 'Bu bloğu yukarı kaydır': 'Slide this block up',

      // Pause
      'Duraklatıldı': 'Paused', 'Devam et': 'Resume', 'Yeniden başlat': 'Restart',
      'Seviye {{ levelIndex }} · Hedef {{ par }} hamle': 'Level {{ levelIndex }} · Target {{ par }} moves',
      'Ana ekrana dönersen bu seviyedeki hamlelerin kaydedilmez.': 'If you go home, your moves on this level won’t be saved.',

      // Win
      'Harika!': 'Great!', 'Seviye {{ levelIndex }} tamamlandı': 'Level {{ levelIndex }} complete', 'Tekrar oyna': 'Play again',
      'Sonraki seviye': 'Next level', 'Tüm seviyeler tamam!': 'All levels done!',
      'Üç yıldız! Mükemmel çözüm.': 'Three stars! Perfect solve.',
      'Üçüncü yıldız için {n} hamle veya daha azıyla bitir.': 'Finish in {n} moves or fewer for the third star.',

      // Levels
      'Tamamlandı': 'Completed', 'Sıradaki': 'Next up', 'Kilitli': 'Locked',

      // NoHints
      'İpucun bitti': 'Out of hints',
      'Kısa bir reklam izleyerek 1 ipucu kazanabilir ya da mağazadan paket alabilirsin.': 'Watch a short ad to earn 1 hint, or get a pack from the shop.',
      'Mağazaya git': 'Go to shop', 'Vazgeç, oyuna dön': 'Never mind, back to game', 'Reklam izle · +1 ipucu': 'Watch ad · +1 hint',

      // Offline
      'Bağlantı yok': 'No connection',
      'Günlük bulmaca, sıralama ve mağaza için internet gerekir. Seviyeleri çevrimdışı oynamaya devam edebilirsin.': 'The daily puzzle, leaderboard and shop need internet. You can keep playing levels offline.',
      'Tekrar dene': 'Try again', 'Çevrimdışı oyna': 'Play offline', 'Hâlâ bağlantı yok': 'Still no connection',

      // Daily
      'Günlük bulmaca': 'Daily puzzle', 'Günlük ödül': 'Daily reward',
      'Pzt': 'Mon', 'Sal': 'Tue', 'Çar': 'Wed', 'Per': 'Thu', 'Cum': 'Fri', 'Cmt': 'Sat', 'Paz': 'Sun',
      'Çözüldü': 'Solved', 'Bugün': 'Today', 'Kaçırıldı': 'Missed',
      'Ocak': 'January', 'Şubat': 'February', 'Mart': 'March', 'Nisan': 'April', 'Mayıs': 'May', 'Haziran': 'June',
      'Temmuz': 'July', 'Ağustos': 'August', 'Eylül': 'September', 'Ekim': 'October', 'Kasım': 'November', 'Aralık': 'December',
      '{n} günlük seri': '{n}-day streak', 'Bugün çözdün, yarın tekrar gel!': 'Solved today, come back tomorrow!',
      'Bugünü de oyna, seriyi {n} güne çıkar.': 'Play today to reach a {n}-day streak.',
      '{d} {m} · {tier}': '{m} {d} · {tier}',
      'Bugün tamamlandı': 'Completed today', 'Ödül: {n} yıldız': 'Reward: {n} stars',
      'Yarın tekrar gel': 'Come back tomorrow', 'Bugünkü bulmacayı oyna': 'Play today’s puzzle',
      'Bugünün bulmacası zaten tamamlandı': 'Today’s puzzle is already done',

      // Reward
      'Her gün gir, ödül büyüsün. 7. gün büyük ödül seni bekliyor.': 'Come back every day and the reward grows. A big prize awaits on day 7.',
      'Sonra': 'Later', '{n}. gün': 'Day {n}', 'Alındı': 'Claimed', 'Bugünü tamamladın': 'You’ve completed today',
      '{n}. gün ödülü için bulmacaya git': 'Go to the puzzle for the day {n} reward',

      // Leaderboard
      'Arkadaşlar': 'Friends', 'Dünya': 'World', 'Sen': 'You',
      'Arkadaşların arasında {n}. sıradasın. (Çevrimdışı, sadece bu cihazda)': 'You’re #{n} among your friends. (Offline, this device only)',
      'Bu cihazdaki sıralamada {n}. sıradasın. (Çevrimdışı, sadece bu cihazda)': 'You’re #{n} on this device’s leaderboard. (Offline, this device only)',

      // Profile
      'Avatarı düzenle': 'Edit avatar', 'Yıldız': 'Stars', 'Biten seviye': 'Levels done', 'Gün serisi': 'Day streak',
      'Tümünü gör': 'See all', 'İlerleme': 'Progress', 'Yıldızlar': 'Stars',
      'İlerlemeyi kaydet · Giriş yap': 'Save progress · Sign in', 'Temalarım': 'My themes',
      'Misafir Oyuncu': 'Guest Player', 'Oyuncu': 'Player', '{tier} paket · Seviye {n}': '{tier} pack · Level {n}',

      // Badges
      'Kazanıldı': 'Earned',
      'İlk çıkış': 'First exit', 'İlk seviyeyi bitir': 'Finish the first level',
      'Üç yıldız': 'Three stars', 'Bir seviyeyi 3 yıldızla bitir': 'Finish a level with 3 stars',
      'Hızlı çözüm': 'Speedy solve', '30 saniyenin altında bitir': 'Finish in under 30 seconds',
      'İpucusuz 10': 'No-hint 10', '10 seviyeyi ipucusuz bitir': 'Finish 10 levels without hints',
      'Haftalık seri': 'Weekly streak', '7 gün üst üste oyna': 'Play 7 days in a row',
      '{n} seviye': '{n} levels', 'Tüm seviyeleri tamamla': 'Complete all levels',
      'Kusursuz paket': 'Perfect pack', 'Bir paketi tam yıldızla bitir': 'Finish a pack with full stars',
      'Koleksiyoncu': 'Collector', 'Tüm temaları aç': 'Unlock all themes',
      'Günlük usta': 'Daily master', '30 günlük bulmaca çöz': 'Solve 30 daily puzzles',

      // Shop
      'Mağaza': 'Shop', 'İpucu paketleri': 'Hint packs', 'ipucu': 'hints', 'En çok alınan': 'Most popular',
      'Ücretsiz': 'Free', 'Reklam izle': 'Watch an ad', '1 ipucu kazan': 'Earn 1 hint', '6 yıldız kazan': 'Earn 6 stars', '+6 yıldız kazandın': 'You earned +6 stars', 'İzle': 'Watch',
      'Reklamsız oyna': 'Play ad-free', 'Reklamları kaldır': 'Remove ads', 'Tek seferlik, yıldızla': 'One-time, with stars',
      'Temalar yıldızla açılır · Temalara git': 'Themes unlock with stars · Go to themes',
      'Satın alımları geri yükle': 'Restore purchases', 'Emin misin?': 'Are you sure?', 'Evet, satın al': 'Yes, buy',
      '+{n} ipucu eklendi': '+{n} hints added', 'Reklamlar kaldırıldı': 'Ads removed',
      'Geri yüklenecek bir satın alım bulunamadı': 'No purchases to restore',
      '{h} ipucu almak için {c} yıldız harcanacak.': '{c} stars will be spent for {h} hints.',

      // Themes
      'Önizleme': 'Preview', 'Seçili': 'Selected', 'Sende var': 'Owned', 'Kullanılıyor': 'In use',
      'Temayı kullan': 'Use theme', 'Kilidi aç ({n} ★)': 'Unlock ({n} ★)', 'Şu an kullanılıyor': 'Currently in use',
      'Koleksiyonunda': 'In your collection', '{n} yıldızla açılır': 'Unlocks with {n} stars',
      '{name} teması uygulandı': '{name} theme applied', '{name} açıldı!': '{name} unlocked!',

      // Settings
      'Ses efektleri': 'Sound effects', 'Müzik': 'Music', 'Titreşim': 'Vibration', 'Bildirimler': 'Notifications',
      'Dil': 'Language', 'Hesap ve giriş': 'Account & sign-in', 'Sürüm 1.0.0': 'Version 1.0.0',
      'İlerlemeyi sıfırla': 'Reset progress', 'Emin misin? Tekrar dokun': 'Are you sure? Tap again',
      'Emin misin? Tekrar dokun: tüm ilerleme silinecek': 'Are you sure? Tap again: all progress will be erased',
      'Bu cihaz titreşimi desteklemiyor': 'This device doesn’t support vibration',

      // Avatar
      'Avatarını oluştur': 'Create your avatar', 'Rastgele oluştur': 'Randomize', 'Avatar önizlemesi': 'Avatar preview',
      'Özel renk ekle': 'Add custom color', 'Evcil hayvan': 'Pet', 'Ten rengi': 'Skin color', 'Zemin rengi': 'Background color',
      'Avatarı kaydet': 'Save avatar',
      'Temel': 'Basics', 'Saç': 'Hair', 'Göz': 'Eyes', 'Bıyık': 'Moustache', 'Gözlük': 'Glasses', 'Aksesuar': 'Accessories', 'Pet': 'Pet',
      'Yüz şekli': 'Face shape', 'Burun şekli': 'Nose shape', 'Dudak şekli': 'Lip shape', 'Kulak şekli': 'Ear shape',
      'Saç modeli': 'Hairstyle', 'Göz şekli': 'Eye shape', 'Kaş şekli': 'Eyebrow shape', 'Kirpik': 'Eyelashes',
      'Bıyık ve sakal': 'Moustache & beard', 'Küpe': 'Earrings', 'Kolye': 'Necklace', 'Piercing': 'Piercing',
      'Toka': 'Hair clip', 'Şapka': 'Hat', 'Atkı': 'Scarf', 'Kulaklık': 'Headphones',
      'Saç rengi': 'Hair color', 'Saç ve sakal rengi': 'Hair & beard color', 'Göz rengi': 'Eye color',
      'Gözlük rengi': 'Glasses color', 'Kıyafet rengi': 'Clothing color', 'Rozet rengi': 'Badge color',
      'Yuvarlak': 'Round', 'Oval': 'Oval', 'Köşeli': 'Angular', 'Düz': 'Straight', 'Kalkık': 'Upturned', 'Geniş': 'Wide',
      'İnce': 'Thin', 'Dolgun': 'Full', 'Geniş gülümseme': 'Wide smile', 'Normal': 'Normal', 'Büyük': 'Big', 'Sivri': 'Pointed',
      'Kısa': 'Short', 'Uzun': 'Long', 'Dalgalı uzun': 'Wavy long', 'Dalgalı kısa': 'Wavy short', 'Kıvırcık uzun': 'Curly long',
      'Kıvırcık kısa': 'Curly short', 'At kuyruğu': 'Ponytail', 'Topuz': 'Bun', 'Kel': 'Bald',
      'Badem': 'Almond', 'İri': 'Large', 'Doğal': 'Natural', 'Kalın': 'Thick', 'Çatık': 'Furrowed',
      'Yok': 'None', 'Var': 'On', 'Sakal': 'Beard', 'Kirli': 'Stubble', 'Güneş': 'Sunglasses',
      // colors
      'Açık': 'Light', 'Buğday': 'Wheat', 'Esmer': 'Tan', 'Bronz': 'Bronze', 'Koyu': 'Dark',
      'Siyah': 'Black', 'Kahverengi': 'Brown', 'Kahve': 'Brown', 'Sarı': 'Yellow', 'Kızıl': 'Auburn', 'Gri': 'Gray',
      'Yeşil': 'Green', 'Mavi': 'Blue', 'Ela': 'Hazel', 'Kırmızı': 'Red', 'Altın': 'Gold', 'Turuncu': 'Orange',
      'Teal': 'Teal', 'Pembe': 'Pink', 'Mor': 'Purple', 'Beyaz': 'White', 'Lacivert': 'Navy', 'Bordo': 'Burgundy',
      'Koyu yeşil': 'Dark green',
      // pets
      'Siyah Kedi': 'Black cat', 'Beyaz Kedi': 'White cat', 'Kahve Kedi': 'Brown cat', 'Köpek': 'Dog',
      'Poodle': 'Poodle', 'Golden': 'Golden', 'Pati': 'Paw', 'Papağan': 'Parrot', 'Baykuş': 'Owl',
      'Penguen': 'Penguin', 'Tavşan': 'Rabbit'
    }
  };

  // Further languages live in lang/<id>.json and are attached here by assemble.py.
  App.DICT = DICT;

  App.lang = function () { return App.data.settings.dil || 'tr'; };

  // Translate a source (Turkish) string; unknown strings fall through unchanged.
  // Non-Turkish languages fall back to English for any string they lack.
  var has = Object.prototype.hasOwnProperty;
  App.tr = function (s) {
    var id = App.lang();
    if (id === 'tr') return s;
    var d = DICT[id];
    if (d && has.call(d, s)) return d[s];
    return has.call(DICT.en, s) ? DICT.en[s] : s;
  };

  App.t = function (s, params) {
    var out = App.tr(s);
    if (params) out = out.replace(/\{(\w+)\}/g, function (m, k) { return params[k] != null ? params[k] : m; });
    return out;
  };

  App.setLang = function (id) {
    App.data.settings.dil = id;
    App.save();
    document.documentElement.lang = id;
  };
  document.documentElement.lang = App.lang();
})(window.App);
