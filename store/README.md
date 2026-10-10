# Sliding Block Puzzle – Mağazalara yayın rehberi

Bu klasör ve projedeki `ios/`, `android/` klasörleri uygulamayı App Store ve Google Play'e
yüklemeye hazır hale getirir. Aşağıdaki adımları sırayla izle.

| | |
|---|---|
| Uygulama adı | Sliding Block Puzzle (ana ekranda: "Sliding Block") |
| Paket kimliği (bundle ID / applicationId) | `com.theznz.slideblocks` — yayından sonra değişmez |
| Sürüm | 1.0.0 (build 1) |
| Kategori | Oyunlar → Bulmaca (Games → Puzzle) |
| Gizlilik politikası | https://theznz.github.io/slide-blocks-app/privacy.html |
| Destek sayfası | https://github.com/theznz/slide-blocks-app/issues |
| Cihazlar | iPhone (dikey), Android telefon (dikey). iPad'de iPhone uygulaması olarak çalışır. |

---

## 1. Durum (10.10.2026)

Uygulama tarafı hazır; eksik olan sadece geliştirici hesapları ve yükleme.

- Giriş ekranı 1.0'da gizlendi (Profil ve Ayarlar'daki bağlantılar kaldırıldı); ilerleme cihazda saklanıyor.
- Uydurma sıralama kaldırıldı; yerine kişisel **Rekorlarım** ekranı geldi.
- "Reklamları kaldır" ve "Satın alımları geri yükle" kaldırıldı. **"Reklam izle"** bilerek bırakıldı (ileride
  gerçek reklam eklenecek). Şu an gerçek reklam göstermediği için inceleyici sorarsa "ödül butonu, reklam
  entegrasyonu sonraki sürümde" diye açıklanabilir ya da adı "Ücretsiz ödül" yapılabilir.
- iOS: gizlilik bildirimi (`PrivacyInfo.xcprivacy`: takip yok, veri toplanmıyor) uygulamada; derleme uyarısız.
- Android: imzalı mağaza paketi hazır (aşağıda). Yerel kütüphane yok, 16 KB sayfa kuralı etkilemiyor;
  `SCHEDULE_EXACT_ALARM` izni yok.
- iPhone'da Xcode ile kişisel takımla (Personal Team) test edildi; Android 16 emülatöründe test edildi.

## 2. Hesaplar

1. **Apple Developer Program** (yıllık 99 $): https://developer.apple.com/programs/enroll/
   Apple ID ile giriş yap → "Individual / Sole Proprietor" seç. Onay 1–2 gün sürebilir.
2. **Google Play Console** (tek seferlik 25 $): https://play.google.com/console/signup
   "Yourself" (kişisel) hesap seç; kimlik doğrulaması isteniyor.
   - **Önemli:** Yeni kişisel hesaplarda Google, uygulamayı herkese açmadan önce
     **en az 12 test kullanıcısıyla 14 gün kapalı test** istiyor. Bunu baştan planla.

## 3. Bilgisayar kurulumu (bir kez)

1. **Xcode:** Mac App Store → "Xcode" → Yükle (yaklaşık 15 GB). Açıp ek bileşenleri kurmasına izin ver.
   Sonra Terminal'de: `sudo xcode-select -s /Applications/Xcode.app`
2. **Android Studio:** https://developer.android.com/studio → indir, kur, ilk açılışta "Standard" kurulumu seç
   (Android SDK'yı kendisi kurar).
   - **Java 21 gerekli:** Projenin Gradle sürümü (8.14) Android Studio'nun içindeki Java 25 ile çalışmıyor.
     `android/gradle/gradle-daemon-jvm.properties` Gradle'a Java 21 kullanmasını söylüyor; bilgisayarda
     Java 21 kurulu olmalı (ör. Eclipse Temurin 21: https://adoptium.net). Bu Mac'te
     `~/Library/Java/JavaVirtualMachines/jdk-21…` altında kurulu.
3. Proje klasöründe bir kez: `npm install`

## 4. Her yayından önce

```bash
npm test          # 100 seviyenin hepsinin çözülebildiğini doğrular
npm run sync      # oyunu derler ve ios/ + android/ projelerine kopyalar
```

Yeni sürümde numaraları artır:
- iOS: Xcode → App hedefi → General → **Version** (1.0.1) ve **Build** (2)
- Android: `android/app/build.gradle` → `versionName "1.0.1"` ve `versionCode 2`

## 5. iPhone – App Store

1. `npm run ios` → Xcode açılır.
2. Sol üstte **App** projesi → **Signing & Capabilities** → **Team**: Apple Developer Program'a kayıtlı
   takımı seç. (Şu an "Personal Team" seçili; o sadece kendi telefonuna kurmaya yarar, mağazaya yüklenemez.)
   "Automatically manage signing" açık kalsın. Bundle Identifier `com.theznz.slideblocks` olmalı.
3. Kendi iPhone'unda denemek için: iPhone'u kabloyla bağla, üstteki cihaz listesinden seç, ▶ (Run).
   Telefonda: Ayarlar → Genel → VPN ve Cihaz Yönetimi → geliştiriciye güven.
4. **App Store Connect**'te uygulamayı oluştur: https://appstoreconnect.apple.com → Uygulamalar → **+** →
   Yeni Uygulama → iOS, ad "Sliding Block Puzzle", birincil dil Türkçe, bundle ID `com.theznz.slideblocks`,
   SKU `slideblocks001`.
   (Ad alınmışsa "Sliding Block Puzzle – Kaydır" gibi küçük bir değişiklik yap.)
5. Xcode'da cihaz olarak **Any iOS Device (arm64)** seç → menü **Product → Archive**.
   Arşiv bitince **Distribute App → App Store Connect → Upload**.
6. App Store Connect → **TestFlight**: yüklenen build 10–30 dakikada görünür; kendini test kullanıcısı
   olarak ekleyip TestFlight uygulamasından dene.
7. **App Store** sekmesinde: metinler (bölüm 8), ekran görüntüleri (`store/screenshots/ios-6.9-*.png`),
   gizlilik politikası URL'si, yaş sınırı, App Privacy formu (bölüm 6) → build'i seç → **Add for Review**.
   İnceleme genellikle 1–3 gün.

## 6. App Store formları

- **App Privacy (Uygulama Gizliliği):** "Data Not Collected" (Veri Toplanmıyor).
  Uygulama hiçbir veri toplamıyor, analiz/reklam SDK'sı yok; her şey cihazda.
- **Yaş sınırı:** Tüm sorulara "None/Yok" → **4+**.
- **Export Compliance:** `ITSAppUsesNonExemptEncryption = false` projede ayarlı, soru sorulmaz.
- **Sign in with Apple:** Giriş gerçekten eklenirse gerekir (bkz. bölüm 1).

## 7. Android – Google Play

1. `npm run android` → Android Studio açılır (ilk açılışta Gradle senkronizasyonu birkaç dakika sürer).
2. Kendi telefonunda denemek için: telefonda Geliştirici seçenekleri → USB hata ayıklama açık, kabloyla bağla, ▶ Run.
3. Yükleme paketi **hazır**: `android/app/build/outputs/bundle/release/app-release.aab`
   - Yeniden üretmek için: `npm run sync && cd android && ./gradlew bundleRelease`
   - Paket, bu Mac'te oluşturulan **upload key** ile imzalanıyor: `~/.slideblocks/upload-key.jks`
     (şifresi `~/.slideblocks/upload-key.properties` içinde). Proje klasörünün dışında, GitHub'a gitmez.
   - **Bu iki dosyayı mutlaka yedekle** (ör. bir parola yöneticisine ya da şifreli bir USB'ye).
     Kaybedilirse Play Console'dan anahtar sıfırlama istenmesi gerekir.
   - Anahtar parmak izi (SHA-256): `30:DF:28:F0:FF:7C:3F:A8:1E:1A:09:EE:91:68:20:FB:E8:F4:CA:F9:A3:83:3B:1B:46:20:42:72:36:1C:89:9C`
4. **Play Console** → Uygulama oluştur → ad "Sliding Block Puzzle", varsayılan dil Türkçe, Oyun, Ücretsiz.
5. Sol menüdeki **Uygulamayı ayarla** görevlerini tamamla:
   - **Gizlilik politikası:** https://theznz.github.io/slide-blocks-app/privacy.html
   - **Uygulama erişimi:** Tüm işlevler kısıtlamasız kullanılabilir.
   - **Reklamlar:** "Hayır, reklam içermiyor" (gerçek reklam eklenince "Evet" yapılmalı).
   - **İçerik derecelendirmesi:** Kategori "Oyun", şiddet/korku vb. sorulara "Hayır" → PEGI 3 / Everyone.
   - **Hedef kitle:** Öneri **13 yaş ve üzeri**. 13 yaş altını seçersen Google'ın Aileler politikası
     devreye girer; ileride reklam eklemek için sertifikalı reklam SDK'sı gerekir.
   - **Veri güvenliği (Data safety):** "Uygulama kullanıcı verisi toplamıyor veya paylaşmıyor."
   - **Haber uygulaması:** Hayır. **Devlet uygulaması:** Hayır.
6. **Mağaza girişi:** metinler (bölüm 8), simge (`assets/icon-only.png` 512 px'e küçültülmüş hali:
   `icons/icon-512.png`), öne çıkan görsel (`store/screenshots/google-play-feature-graphic-tr.png`),
   telefon ekran görüntüleri (`store/screenshots/android-phone-*.png`).
7. **Test → Kapalı test** → yeni sürüm → `.aab` dosyasını yükle → test kullanıcılarını (e-posta listesi) ekle.
   14 gün / 12 kişi şartı tamamlanınca **Üretim** (Production) erişimi iste ve yayınla.
   "Play App Signing" önerilirse kabul et (Google uygulama imzalama anahtarını saklar).

---

## 8. Mağaza metinleri

### Türkçe

**Ad (30):** Sliding Block Puzzle
**Alt başlık – App Store (30):** Blokları kaydır, yolu aç
**Kısa açıklama – Google Play (80):** Blokları kaydır, oklu bloğu çıkışa ulaştır! 100 seviye, günlük bulmaca.
**Tanıtım metni – App Store (170):** Her gün yeni bir bulmaca, 100 seviye ve 10 tema. Hedef hamlede bitir, konfetiyi patlat!

**Açıklama:**

Blokları kaydır, yolu aç, oklu bloğu çıkışa ulaştır!

Sliding Block Puzzle, klasik blok kaydırma bulmacasını rengarenk ve rahatlatıcı bir oyuna dönüştürür.
Her blok sadece kendi yönünde kayar: yatay bloklar sağa sola, dikey bloklar yukarı aşağı. Doğru sırayı
bul, oklu bloğun yolunu aç ve onu çıkışa ulaştır.

• 100 seviye, 5 zorluk paketi: Kolay'dan Efsane'ye kadar
• Çıkış her seviyede farklı bir kenarda: sağ, sol, yukarı ya da aşağı
• Kımıldamayan duvarlar ve uzun bloklarla yeni zorluklar
• Her bulmacanın en kısa çözümü hesaplandı: hedef hamlede bitir, üç yıldızı al
• Günlük bulmaca ve günlük seri ödülleri
• Takıldığında ipucu: sıradaki en iyi hamleyi gösterir
• 10 tema: Şekerleme, Balon, Jöle, Cam, Metalik ve daha fazlası
• Kendi avatarını oluştur
• Ses efektleri, müzik ve titreşim
• İnternetsiz oynanır, hesap gerekmez, veri toplanmaz
• 8 dil: Türkçe, English, Deutsch, Español, Français, Italiano, Português, Русский

**Anahtar kelimeler – App Store (100, virgülle, boşluksuz):**
`bulmaca,blok,kaydır,zeka,mantık,beyin,yapboz,çıkış,strateji,günlük,klasik,puzzle,oyun,park,ipucu`

### English

**Name (30):** Sliding Block Puzzle
**Subtitle – App Store (30):** Slide blocks, free the arrow
**Short description – Google Play (80):** Slide the blocks and guide the arrow block out! 100 levels and a daily puzzle.
**Promotional text – App Store (170):** A new puzzle every day, 100 levels and 10 themes. Solve it in the target moves and pop the confetti!

**Description:**

Slide the blocks, clear the way, and guide the arrow block to the exit!

Sliding Block Puzzle turns the classic sliding-block brain teaser into a colourful, relaxing game.
Every block slides only along its own direction: horizontal blocks left and right, vertical blocks up
and down. Find the right order, clear the path and get the arrow block out.

• 100 levels in 5 packs, from Easy to Legend
• The exit moves around: right, left, top or bottom
• Immovable walls and long blocks add new twists
• Every puzzle's shortest solution is known: finish in the target moves for three stars
• Daily puzzle with streak rewards
• Stuck? A hint shows the next best move
• 10 themes: Gummy, Balloon, Jelly, Glass, Metallic and more
• Build your own avatar
• Sound effects, music and haptics
• Plays offline, no account needed, no data collected
• 8 languages: English, Türkçe, Deutsch, Español, Français, Italiano, Português, Русский

**Keywords – App Store (100):**
`puzzle,block,slide,logic,brain,teaser,escape,daily,classic,iq,mind,strategy,casual,parking,hint`

> Not: "Rush Hour" ve "Unblock Me" başka şirketlerin markaları; metinlerde ve anahtar kelimelerde kullanma.

---

## 9. Hazır dosyalar

| Dosya | Ne için |
|---|---|
| `store/screenshots/ios-6.9-tr-*.png`, `ios-6.9-en-*.png` | App Store iPhone 6.9" ekran görüntüleri (1320×2868) |
| `store/screenshots/android-phone-tr-*.png`, `android-phone-en-*.png` | Google Play telefon ekran görüntüleri (1080×2400) |
| `store/screenshots/google-play-feature-graphic-tr.png` / `-en.png` | Google Play öne çıkan görsel (1024×500) |
| `assets/icon-only.png` | 1024×1024 simge kaynağı (saydamlıksız) |
| `assets/icon-foreground.png`, `icon-background.png` | Android uyarlanabilir simge katmanları |
| `assets/splash.png` | Açılış ekranı kaynağı |
| `privacy.html` | Gizlilik politikası (GitHub Pages'te yayında) |

Simgeyi değiştirirsen: `assets/` içindeki dosyaları güncelle ve `npm run assets` çalıştır.

## 10. Uygulama içinde mağaza sürümüne özel olanlar

- **Gerçek titreşim** (`_design_screens/native.js`): iPhone Taptic Engine ve Android titreşim motoru.
  Blok bırakınca da çalışır; kazanınca başarı titreşimi.
- **Gerçek bildirim:** Günlük bulmaca hatırlatması 19:00'da, uygulama kapalıyken de gelir. Bulmaca çözülünce
  o günün hatırlatması iptal edilir. İzin, ana ekran ilk açıldığında bir kez sorulur.
- **Yazı tipi uygulamanın içinde:** İnternet olmadan da doğru görünür, dışarıya istek gitmez.
