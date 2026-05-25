import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { DB } from '../db.js';

const C = {
  nk: '#003F87',
  pks: '#00796B',
  dll: '#E65100',
  pusat: '#1565C0',
  daerah: '#2E7D32',
  ya: '#003F87',
  tidak: '#BDBDBD',
  pie1: '#003F87',
  pie2: '#E0E0E0',
};

function getSatkerBidang(kode) {
  return DB.satker?.find(s => s.kode === kode)?.bidang || 'Lainnya';
}

function getSatkerArea(kode) {
  return getSatkerBidang(kode) === 'MS (Daerah)' ? 'Daerah' : 'Pusat';
}

function getSatkerNama(kode) {
  return DB.satker?.find(s => s.kode === kode)?.nama || kode;
}

function SectionTitle({ title }) {
  return (
    <div style={{
      fontWeight: 600, fontSize: 15, color: 'var(--on-surface)',
      borderLeft: '4px solid var(--primary)', paddingLeft: 10,
      margin: '28px 0 16px',
    }}>
      {title}
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--outline-variant)',
      padding: '16px', marginBottom: 16,
    }}>
      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 16, color: 'var(--on-surface)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const RADIAN = Math.PI / 180;
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) {
  if (value === 0) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {value}
    </text>
  );
}

// ─── 1. Informasi Pengumpulan Data ────────────────────────────────────────────
const BIDANG_ORDER = ['KS', 'MS (Pusat)', 'PBKN', 'PMDK', 'PPDP', 'PVML', 'IAKD', 'PEPK', 'ARK', 'MS (Daerah)'];

function buildResponseData(data) {
  // Sudah = satker muncul di satker ATAU uker di salah satu form (impl ATAU perp ATAU baru)
  const dbSatkerCodes = new Set(DB.satker?.map(s => s.kode) || []);
  const submitted = new Set();

  [data.impl, data.perp, data.baru].forEach(entries => {
    entries?.forEach(e => {
      if (e.satker && dbSatkerCodes.has(e.satker)) submitted.add(e.satker);
      if (e.uker && dbSatkerCodes.has(e.uker)) submitted.add(e.uker);
    });
  });

  const groups = {};
  BIDANG_ORDER.forEach(b => { groups[b] = { bidang: b, Ya: 0, Tidak: 0 }; });
  DB.satker?.forEach(s => {
    const b = getSatkerBidang(s.kode);
    if (!groups[b]) groups[b] = { bidang: b, Ya: 0, Tidak: 0 };
    if (submitted.has(s.kode)) groups[b].Ya++;
    else groups[b].Tidak++;
  });
  return BIDANG_ORDER.map(b => groups[b]);
}

function InfoPengumpulanChart({ data }) {
  return (
    <ChartBox title="Informasi Pengumpulan Data — Jumlah Satker per Bidang yang Sudah/Belum Menyampaikan Respon">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={buildResponseData(data)} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
          <XAxis dataKey="bidang" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Ya" name="Sudah Menyampaikan" stackId="a" fill={C.ya} radius={[0,0,0,0]} />
          <Bar dataKey="Tidak" name="Belum Menyampaikan" stackId="a" fill={C.tidak} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ─── 2. Perpanjangan ──────────────────────────────────────────────────────────
function buildPerpDonut(data, jenis) {
  // Filter dokumen yang akan nonaktif 2026 dengan status Aktif
  const expDocs = DB.kerjasama?.filter(k =>
    k.jenis === jenis && k.status === 'Aktif' && k.tgl_selesai?.includes('2026')
  ) || [];
  // Lookup ke Form_Dokumen_Perpanjangan
  const perpNomors = new Set(data.perp.map(e => e.nomor));
  const ada = expDocs.filter(d => perpNomors.has(d.nomor)).length;
  const tidak = expDocs.length - ada;
  return {
    total: expDocs.length,
    chartData: [
      { name: 'Terdapat Usulan', value: ada },
      { name: 'Tidak Ada Usulan', value: tidak },
    ],
    docs: expDocs,
  };
}

function DonutChart({ title, data }) {
  const total = data.chartData.reduce((s, d) => s + d.value, 0);
  return (
    <ChartBox title={title}>
      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--on-surface-variant)', fontSize: 13 }}>
          Tidak ada dokumen {title.includes('NK') ? 'NK' : 'PKS'} yang berakhir pada 2026.
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <PieChart width={180} height={180}>
            <Pie
              data={data.chartData}
              cx={85} cy={85}
              innerRadius={50} outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={DonutLabel}
            >
              <Cell fill={C.pie1} />
              <Cell fill={C.pie2} />
            </Pie>
            <Tooltip />
          </PieChart>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 8 }}>
              Total: <strong style={{ color: 'var(--on-surface)' }}>{total}</strong> dokumen berakhir 2026
            </div>
            {data.chartData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: i === 0 ? C.pie1 : C.pie2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--on-surface)' }}>
                  {d.name}: <strong>{d.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartBox>
  );
}

function PerpTable({ data }) {
  // Deduplicate by nomor to ensure unique entries
  const seen = new Set();
  const uniqueEntries = data.perp.filter(d => {
    if (seen.has(d.nomor)) return false;
    seen.add(d.nomor);
    return true;
  });

  if (uniqueEntries.length === 0) return (
    <div style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)', fontSize: 13 }}>
      Belum ada usulan perpanjangan.
    </div>
  );
  return (
    <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto', borderRadius: 8, border: '1px solid var(--outline-variant)' }}>
      <table className="rekap-table">
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)' }}>
          <tr>
            <th>No.</th>
            <th>No. Dokumen</th>
            <th>Judul Dokumen</th>
            <th>Mitra</th>
          </tr>
        </thead>
        <tbody>
          {uniqueEntries.map((d, i) => (
            <tr key={d.nomor}>
              <td style={{ width: 40, textAlign: 'center' }}>{i + 1}</td>
              <td className="td-nomor">{d.nomor}</td>
              <td className="td-text">{d.judul || '—'}</td>
              <td className="td-text">{d.mitra || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 3. Kerja Sama Baru ───────────────────────────────────────────────────────
function buildBaruByKategori(data) {
  const result = {};
  (DB.kategori_kemitraan || []).forEach(k => {
    result[k] = { kategori: k, NK: 0, PKS: 0, DLL: 0 };
  });
  data.baru.forEach(e => {
    const kat = e.kategori || 'Lainnya';
    if (!result[kat]) result[kat] = { kategori: kat, NK: 0, PKS: 0, DLL: 0 };
    if (e.jenis === 'Nota Kesepahaman') result[kat].NK++;
    else if (e.jenis === 'Perjanjian Kerja Sama') result[kat].PKS++;
    else result[kat].DLL++;
  });
  return Object.values(result);
}

function buildTop10Satker(data) {
  const counts = {};
  data.baru.forEach(e => {
    const uker = e.uker || 'N/A';
    counts[uker] = (counts[uker] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([kode, count], i) => ({ no: i + 1, satker: kode, count }));
}

function BaruStackedChart({ data }) {
  const chartData = buildBaruByKategori(data);
  const hasData = data.baru.length > 0;
  return (
    <ChartBox title="Jumlah Usulan Kerja Sama Baru berdasarkan Kategori Kemitraan dan Jenis Dokumen">
      {!hasData ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)', fontSize: 13 }}>
          Belum ada usulan kerja sama baru.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis
              dataKey="kategori"
              tick={{ fontSize: 10 }}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="NK" name="Nota Kesepahaman" stackId="a" fill={C.nk} />
            <Bar dataKey="PKS" name="Perjanjian Kerja Sama" stackId="a" fill={C.pks} />
            <Bar dataKey="DLL" name="DLL (Lainnya)" stackId="a" fill={C.dll} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartBox>
  );
}

function Top10SatkerTable({ data }) {
  const rows = buildTop10Satker(data);
  if (rows.length === 0) return (
    <div style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)', fontSize: 13 }}>
      Belum ada data.
    </div>
  );
  return (
    <div className="table-wrapper">
      <table className="rekap-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Satuan Kerja</th>
            <th style={{ textAlign: 'center' }}>Jumlah Usulan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.no}>
              <td style={{ width: 40, textAlign: 'center' }}>{r.no}</td>
              <td className="td-uker">{r.satker}</td>
              <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--tertiary)' }}>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 4. Implementasi ──────────────────────────────────────────────────────────
function buildRLByArea(data) {
  const counts = {};
  data.impl.forEach(e => {
    const area = getSatkerArea(e.uker);
    const nomor = e.nomor;
    const categories = DB.ruang_lingkup?.[nomor] || [];
    categories.forEach(kategori => {
      if (!kategori) return;
      if (!counts[kategori]) counts[kategori] = { rl: kategori, Pusat: 0, Daerah: 0 };
      counts[kategori][area]++;
    });
  });
  return Object.values(counts)
    .sort((a, b) => (b.Pusat + b.Daerah) - (a.Pusat + a.Daerah));
}

function buildKantorOJKImpl(data) {
  const counts = {};
  const kategoriTarget = 'Edukasi, Literasi, dan Inklusi Keuangan';
  data.impl.forEach(e => {
    const uker = e.uker;
    if (!uker?.startsWith('KO')) return;
    const nomor = e.nomor;
    const categories = DB.ruang_lingkup?.[nomor] || [];
    const edukCount = categories.filter(kat => kat === kategoriTarget).length;
    if (edukCount > 0) {
      if (!counts[uker]) counts[uker] = 0;
      counts[uker] += edukCount;
    }
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([kode, count], i) => ({
      no: i + 1,
      kantor: getSatkerNama(kode),
      count,
    }));
}

function ImplStackedChart({ data }) {
  const chartData = buildRLByArea(data);
  const hasData = data.impl.some(e => e.rl?.length > 0);
  return (
    <ChartBox title="Distribusi Implementasi Kategori Ruang Lingkup Berdasarkan Area">
      {!hasData ? (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)', fontSize: 13 }}>
          Belum ada data implementasi dengan ruang lingkup.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="rl"
              width={200}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Pusat" name="Pusat" stackId="a" fill={C.pusat} />
            <Bar dataKey="Daerah" name="Daerah" stackId="a" fill={C.daerah} radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartBox>
  );
}

function KantorOJKTable({ data }) {
  const rows = buildKantorOJKImpl(data);
  if (rows.length === 0) return (
    <div style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)', fontSize: 13 }}>
      Belum ada data implementasi dari Kantor OJK Daerah.
    </div>
  );
  return (
    <div className="table-wrapper">
      <table className="rekap-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Kantor OJK</th>
            <th style={{ textAlign: 'center' }}>Jumlah Implementasi RL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.no}>
              <td style={{ width: 40, textAlign: 'center' }}>{r.no}</td>
              <td>{r.kantor}</td>
              <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardView({ data }) {
  const nkDonut = buildPerpDonut(data, 'Nota Kesepahaman');
  const pksDonut = buildPerpDonut(data, 'Perjanjian Kerja Sama');

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Informasi Pengumpulan Data */}
      <SectionTitle title="Informasi Pengumpulan Data" />
      <InfoPengumpulanChart data={data} />

      {/* Implementasi */}
      <SectionTitle title="Implementasi Kerja Sama" />
      <ImplStackedChart data={data} />
      <ChartBox title="Implementasi Edukasi, Literasi, dan Inklusi Keuangan per Kantor OJK">
        <KantorOJKTable data={data} />
      </ChartBox>

      {/* Perpanjangan */}
      <SectionTitle title="Usulan Perpanjangan Kerja Sama" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <DonutChart
          title={`Status Tindak Lanjut NK Nonaktif 2026 (${nkDonut.total} dokumen)`}
          data={nkDonut}
        />
        <DonutChart
          title={`Status Tindak Lanjut PKS Nonaktif 2026 (${pksDonut.total} dokumen)`}
          data={pksDonut}
        />
      </div>
      <ChartBox title="Daftar Usulan Perpanjangan Kerja Sama (NK dan PKS)">
        <PerpTable data={data} />
      </ChartBox>

      {/* Kerja Sama Baru */}
      <SectionTitle title="Usulan Kerja Sama Baru" />
      <BaruStackedChart data={data} />
      <ChartBox title="10 Besar Satuan Kerja Pengusul Kerja Sama Baru">
        <Top10SatkerTable data={data} />
      </ChartBox>

    </div>
  );
}
