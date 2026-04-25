# 🎬 CineTrack

Kişisel film & dizi takip uygulaması — TMDb API destekli.

## Dosya Yapısı

```
CineTrack/
├── index.html          ← Ana HTML
├── css/
│   └── style.css       ← Tüm tasarım (koyu sinema teması)
└── js/
    ├── app.js          ← Ana kontrolcü (ES Modules)
    ├── tmdb.js         ← TMDb API çağrıları
    ├── storage.js      ← localStorage yönetimi
    ├── ui.js           ← Render / DOM fonksiyonları
    └── utils/
        └── date.js     ← Tarih yardımcıları
```

## Nasıl Kullanılır

1. `index.html` dosyasını tarayıcıda açın (çift tıklama yeterlidir).
2. Arama kutusuna film veya dizi adı yazın — canlı öneriler gelir.
3. Bir içerik seçin: poster, TMDb puanı, özet ve öneri listesi otomatik yüklenir.
4. Dizi seçtiyseniz sezonlar ve bölümler aşağıda görünür.
5. İsteğe bağlı puanınızı girin, ardından "İzledim" veya "İzleyeceğim" ile ekleyin.
6. Kart üzerindeki **Detay** butonundan not ekleyip puan güncelleyebilirsiniz.

## Özellikler

- 🔍 Canlı TMDb araması (Türkçe dil desteği)
- ⭐ TMDb puanı + kendi puanın (1-10 yıldız)
- 🤖 Yapay zeka benzeri öneri sistemi (TMDb tabanlı)
- 📺 Dizi sezon & bölüm listesi
- 📋 Detay modalı (not, puan, izleme durumu)
- 📊 Anlık istatistik barı
- 🔽 Filtreler (Tümü / İzlendi / İzlenecek) + sıralama
- 📱 Tam mobil uyumlu
- 🎨 Koyu sinema teması

## Notlar

- Veriler tarayıcının `localStorage` alanına kaydedilir.
- İnternet bağlantısı gereklidir (TMDb API için).
- API key zaten dahildir, ek kurulum gerekmez.
- https://efedemirtas48.github.io/CineTrack/
