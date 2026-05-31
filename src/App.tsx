import { useEffect, useState } from 'react';
import './App.css';

const daireler = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];

const aylar = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const yillar = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

type Gider = {
  id: number;
  yil: number;
  ay: string;
  kategori: string;
  tutar: number;
  not: string;
};

export default function App() {
  const [yil, setYil] = useState(2026);
  const [aidat, setAidat] = useState(() => Number(localStorage.getItem('hakverdi_aidat')) || 500);

  const [odeme, setOdeme] = useState<Record<string, boolean>>(() => {
    const kayit = localStorage.getItem('hakverdi_odemeler');
    return kayit ? JSON.parse(kayit) : {};
  });

  const [giderler, setGiderler] = useState<Gider[]>(() => {
    const kayit = localStorage.getItem('hakverdi_giderler');
    return kayit ? JSON.parse(kayit) : [];
  });

  const [giderAy, setGiderAy] = useState('Ocak');
  const [kategori, setKategori] = useState('Temizlik');
  const [tutar, setTutar] = useState('');
  const [not, setNot] = useState('');

  useEffect(() => {
    localStorage.setItem('hakverdi_odemeler', JSON.stringify(odeme));
  }, [odeme]);

  useEffect(() => {
    localStorage.setItem('hakverdi_giderler', JSON.stringify(giderler));
  }, [giderler]);

  useEffect(() => {
    localStorage.setItem('hakverdi_aidat', String(aidat));
  }, [aidat]);

  const tikle = (daire: string, ay: string) => {
    const key = `${yil}-${daire}-${ay}`;
    setOdeme({ ...odeme, [key]: !odeme[key] });
  };

  const giderEkle = () => {
    if (!tutar || Number(tutar) <= 0) return;

    const yeniGider: Gider = {
      id: Date.now(),
      yil,
      ay: giderAy,
      kategori,
      tutar: Number(tutar),
      not,
    };

    setGiderler([yeniGider, ...giderler]);
    setTutar('');
    setNot('');
  };

  const giderSil = (id: number) => {
    setGiderler(giderler.filter((g) => g.id !== id));
  };

  const makbuzYazdir = (daire: string, ay: string) => {
    const tarih = new Date().toLocaleDateString('tr-TR');

    const html = `
      <html>
        <head>
          <title>Makbuz</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            .box { border: 2px solid #111; padding: 30px; border-radius: 12px; }
            h1 { text-align: center; }
            p { font-size: 18px; line-height: 1.7; }
            .imza { margin-top: 60px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Hakverdi Apartmanı Aidat Makbuzu</h1>
            <p><b>Daire:</b> ${daire}</p>
            <p><b>Ay:</b> ${ay} ${yil}</p>
            <p><b>Tutar:</b> ${aidat.toLocaleString('tr-TR')} TL</p>
            <p><b>Açıklama:</b> ${aidat.toLocaleString('tr-TR')} TL aidat alınmıştır.</p>
            <p><b>Tarih:</b> ${tarih}</p>
            <div class="imza">
              <p>Yönetici İmza</p>
            </div>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `;

    const pencere = window.open('', '_blank');
    if (pencere) {
      pencere.document.write(html);
      pencere.document.close();
    }
  };

  const yilinGiderleri = giderler.filter((g) => g.yil === yil);

  const toplamToplanan = aylar.reduce((toplam, ay) => {
    return toplam + daireler.filter((d) => odeme[`${yil}-${d}-${ay}`]).length * aidat;
  }, 0);

  const toplamGider = yilinGiderleri.reduce((toplam, g) => toplam + g.tutar, 0);
  const kasaBakiyesi = toplamToplanan - toplamGider;

  const borclular = daireler.map((daire) => {
    const borcluAylar = aylar.filter((ay) => !odeme[`${yil}-${daire}-${ay}`]);

    return {
      daire,
      borcluAylar,
      aySayisi: borcluAylar.length,
      toplamBorc: borcluAylar.length * aidat,
    };
  }).filter((item) => item.aySayisi > 0);

  const bugun = new Date();
  const ayinGunu = bugun.getDate();
  const aidatUyarisi =
    ayinGunu >= 25
      ? 'Aidat ödeme dönemi yaklaşıyor. Ödeme yapmayan daireleri kontrol edin.'
      : 'Aidat dönemi için sistem hazır.';

  return (
    <div className="app">
      <h1>Hakverdi Apartmanı</h1>
      <p>Yönetici aidat, gelir ve gider takip sistemi</p>

      <div className="warningBox">🔔 {aidatUyarisi}</div>

      <div className="controls">
        <select value={yil} onChange={(e) => setYil(Number(e.target.value))}>
          {yillar.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <input
          type="number"
          value={aidat}
          onChange={(e) => setAidat(Number(e.target.value))}
          placeholder="Aidat tutarı"
        />
      </div>

      <div className="cards">
        <div className="card">
          <span>Toplam Daire</span>
          <b>{daireler.length}</b>
        </div>

        <div className="card">
          <span>Toplanan Para</span>
          <b>{toplamToplanan.toLocaleString('tr-TR')} TL</b>
        </div>

        <div className="card">
          <span>Toplam Gider</span>
          <b>{toplamGider.toLocaleString('tr-TR')} TL</b>
        </div>

        <div className="card">
          <span>Kasa Bakiyesi</span>
          <b>{kasaBakiyesi.toLocaleString('tr-TR')} TL</b>
        </div>
      </div>

      <h2>Aidat Takibi</h2>

      <div className="tableBox">
        <table>
          <thead>
            <tr>
              <th>Daire</th>
              {aylar.map((ay) => (
                <th key={ay}>{ay}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {daireler.map((daire) => (
              <tr key={daire}>
                <td>
                  <b>Daire {daire}</b>
                </td>

                {aylar.map((ay) => {
                  const key = `${yil}-${daire}-${ay}`;

                  return (
                    <td key={ay}>
                      <button
                        className={odeme[key] ? 'paid' : 'unpaid'}
                        onClick={() => tikle(daire, ay)}
                      >
                        {odeme[key] ? '✓' : '×'}
                      </button>

                      {odeme[key] && (
                        <button
                          className="receiptBtn"
                          onClick={() => makbuzYazdir(daire, ay)}
                        >
                          PDF
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>💰 Borçlu Daireler</h2>

      <div className="tableBox">
        <table>
          <thead>
            <tr>
              <th>Daire</th>
              <th>Kaç Ay Borçlu</th>
              <th>Borçlu Aylar</th>
              <th>Toplam Borç</th>
            </tr>
          </thead>

          <tbody>
            {borclular.map((b) => (
              <tr key={b.daire}>
                <td><b>Daire {b.daire}</b></td>
                <td>{b.aySayisi} ay</td>
                <td>{b.borcluAylar.join(', ')}</td>
                <td><b>{b.toplamBorc.toLocaleString('tr-TR')} TL</b></td>
              </tr>
            ))}

            {borclular.length === 0 && (
              <tr>
                <td colSpan={4}>Borçlu daire yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Gider Ekle</h2>

      <div className="expenseBox">
        <select value={giderAy} onChange={(e) => setGiderAy(e.target.value)}>
          {aylar.map((ay) => (
            <option key={ay}>{ay}</option>
          ))}
        </select>

        <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
          <option>Temizlik</option>
          <option>Elektrik</option>
          <option>Asansör</option>
          <option>Su</option>
          <option>Bakım</option>
          <option>Diğer</option>
        </select>

        <input
          type="number"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          placeholder="Tutar"
        />

        <input
          value={not}
          onChange={(e) => setNot(e.target.value)}
          placeholder="Not"
        />

        <button className="addBtn" onClick={giderEkle}>
          Gider Ekle
        </button>
      </div>

      <div className="tableBox">
        <table>
          <thead>
            <tr>
              <th>Ay</th>
              <th>Kategori</th>
              <th>Tutar</th>
              <th>Not</th>
              <th>Sil</th>
            </tr>
          </thead>

          <tbody>
            {yilinGiderleri.map((gider) => (
              <tr key={gider.id}>
                <td>{gider.ay}</td>
                <td>{gider.kategori}</td>
                <td>{gider.tutar.toLocaleString('tr-TR')} TL</td>
                <td>{gider.not}</td>
                <td>
                  <button className="deleteBtn" onClick={() => giderSil(gider.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{yil} Aylık Grafik</h2>

      <div className="grafik">
        {aylar.map((ay) => {
          const sayi = daireler.filter((d) => odeme[`${yil}-${d}-${ay}`]).length;
          const aylikToplam = sayi * aidat;

          return (
            <div className="barRow" key={ay}>
              <span>{ay}</span>
              <div className="barBack">
                <div className="bar" style={{ width: `${sayi * 10}%` }}>
                  {sayi > 0 ? sayi : ''}
                </div>
              </div>
              <b>{aylikToplam.toLocaleString('tr-TR')} TL</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}