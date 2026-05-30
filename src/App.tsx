import { useEffect, useState } from 'react';
import './App.css';

const daireler = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
const aylar = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];
const yillar = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

export default function App() {
  const [yil, setYil] = useState(2026);
  const [aidat, setAidat] = useState(1500);
  const [odeme, setOdeme] = useState<Record<string, boolean>>(() => {
    const kayit = localStorage.getItem('hakverdi_odemeler');
    return kayit ? JSON.parse(kayit) : {};
  });

  useEffect(() => {
    localStorage.setItem('hakverdi_odemeler', JSON.stringify(odeme));
  }, [odeme]);

  const tikle = (daire: string, ay: string) => {
    const key = `${yil}-${daire}-${ay}`;
    setOdeme({ ...odeme, [key]: !odeme[key] });
  };

  const toplamOdenen = aylar.reduce((toplam, ay) => {
    return (
      toplam + daireler.filter((d) => odeme[`${yil}-${d}-${ay}`]).length * aidat
    );
  }, 0);

  const toplamBeklenen = daireler.length * aylar.length * aidat;
  const toplamBorc = toplamBeklenen - toplamOdenen;

  return (
    <div className="app">
      <h1>🏢 Hakverdi Apartmanı</h1>
      <p>Sadece yönetici aidat takip sistemi</p>

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
          <span>Ödenen</span>
          <b>{toplamOdenen.toLocaleString('tr-TR')} TL</b>
        </div>
        <div className="card">
          <span>Borç</span>
          <b>{toplamBorc.toLocaleString('tr-TR')} TL</b>
        </div>
      </div>

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
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{yil} Aylık Grafik</h2>
      <div className="grafik">
        {aylar.map((ay) => {
          const sayi = daireler.filter(
            (d) => odeme[`${yil}-${d}-${ay}`]
          ).length;
          return (
            <div className="barRow" key={ay}>
              <span>{ay}</span>
              <div className="barBack">
                <div className="bar" style={{ width: `${sayi * 10}%` }}>
                  {sayi > 0 ? sayi : ''}
                </div>
              </div>
              <b>{(sayi * aidat).toLocaleString('tr-TR')} TL</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
