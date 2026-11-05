import React, { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Download,
  Eye,
  Building2,
  Layers,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { exportProjectToExcel, exportProjectToPdf } from "../../utils/exportUtils";

export const ReportsExportView: React.FC = () => {
  const { activeProject } = useProjects();
  const res = activeProject.calculationResult;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#286B9B] uppercase tracking-wider mb-1">
            <FileDown className="w-4 h-4" />
            <span>Pusat Penerbitan Laporan & Ekspor Data Teknik</span>
          </div>
          <h2 className="text-xl font-bold text-[#142D45]">Reports & Export Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi resmi perancangan campuran beton, evaluasi laboratorium, dan lembar kerja multi-sheet
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportProjectToExcel(activeProject)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => exportProjectToPdf(activeProject)}
            className="px-4 py-2 bg-[#142D45] hover:bg-[#1D3E5E] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Resmi</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Cetak via Browser"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Excel Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Workbook Excel Lengkap (10 Sheet)</h3>
              <p className="text-xs text-slate-500">Format Microsoft Excel .xlsx standar industri</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800 text-[11px] mb-1">Daftar Sheet yang Disertakan:</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <span>1. Project Information</span>
              <span>6. Final Mix Composition</span>
              <span>2. Material Properties</span>
              <span>7. Testing Results</span>
              <span>3. Mix Design Input</span>
              <span>8. Strength Analysis</span>
              <span>4. Mix Calculation</span>
              <span>9. Innovation Comparison</span>
              <span>5. Moisture Correction</span>
              <span>10. References</span>
            </div>
          </div>

          <button
            onClick={() => exportProjectToExcel(activeProject)}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File Excel Proyek Ini</span>
          </button>
        </div>

        {/* PDF Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Laporan Teknik Resmi PDF</h3>
              <p className="text-xs text-slate-500">Format dokumen siap cetak & presentasi</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800 text-[11px] mb-1">Konten Dokumen PDF:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Kop Laporan Teknik MIXLAB & Identitas Proyek</li>
              <li>Tabel Komposisi Campuran 1 m³ dan Kebutuhan Batch Uji</li>
              <li>Rincian Koreksi Kadar Air Agregat Lapangan</li>
              <li>Hasil Uji Benda Tekan Laboratorium & Evaluasi SNI 2847</li>
            </ul>
          </div>

          <button
            onClick={() => exportProjectToPdf(activeProject)}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* In-Browser Document Preview Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#286B9B]" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Pratinjau Dokumen Teknik (In-App Document Preview)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            ID: {activeProject.id}
          </span>
        </div>

        {/* Formal Document Layout */}
        <div className="max-w-4xl mx-auto border border-slate-300 rounded-lg p-8 bg-white space-y-6 text-xs shadow-xs">
          {/* Document Header */}
          <div className="border-b-2 border-[#142D45] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#142D45] text-white flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#64B5F6]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#142D45]">MIXLAB CIVIL ENGINEERING WORKSPACE</h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  LAPORAN HASIL PERANCANGAN CAMPURAN & PENGUJIAN BETON
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>Tanggal: {new Date().toLocaleDateString("id-ID")}</p>
              <p className="font-semibold text-emerald-700">SNI Certified Calculation</p>
            </div>
          </div>

          {/* Project Overview Table */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Proyek</span>
              <span className="font-bold text-slate-900 text-sm">{activeProject.name}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">{activeProject.description}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Metode Perancangan</span>
              <span className="font-bold text-[#286B9B] font-mono">{activeProject.parameters.method.replace(/_/g, " ")}</span>
              <span className="text-slate-600 block text-[11px] mt-0.5">
                Target f'c {activeProject.parameters.targetStrengthFc} MPa · Slump {activeProject.parameters.slumpMin}-{activeProject.parameters.slumpMax} mm
              </span>
            </div>
          </div>

          {/* Final Composition Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              1. Komposisi Campuran Beton per 1 m³ dan Kebutuhan Batch
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#142D45] text-white">
                <tr>
                  <th className="py-2 px-3">Material</th>
                  <th className="py-2 px-3 text-right">Proporsi SSD (kg/m³)</th>
                  <th className="py-2 px-3 text-right">Massa Ditimbang (kg/m³)</th>
                  <th className="py-2 px-3 text-right">Kebutuhan Batch ({res?.batchRequirements.volumeM3} m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-semibold">Air Bersih</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.waterContentDesignKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#286B9B]">{res?.moistureCorrection.netWaterToBatchKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.batchRequirements.waterKg} kg</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Semen Portland</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.cementContentKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.cementContentKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.batchRequirements.cementKg} kg</td>
                </tr>
                {res?.supplementaryContentKg ? (
                  <tr>
                    <td className="py-2 px-3 font-semibold">Supplementary SCM</td>
                    <td className="py-2 px-3 text-right font-mono">{res.supplementaryContentKg} kg</td>
                    <td className="py-2 px-3 text-right font-mono">{res.supplementaryContentKg} kg</td>
                    <td className="py-2 px-3 text-right font-mono">{res.batchRequirements.supplementaryKg} kg</td>
                  </tr>
                ) : null}
                <tr>
                  <td className="py-2 px-3 font-semibold">Pasir (Agregat Halus)</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.fineAggregateKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#286B9B]">{res?.moistureCorrection.fineAggregateWetKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.batchRequirements.fineAggregateWetKg} kg</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Kerikil (Agregat Kasar)</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.coarseAggregateKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#286B9B]">{res?.moistureCorrection.coarseAggregateWetKg} kg</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.batchRequirements.coarseAggregateWetKg} kg</td>
                </tr>
                {res?.admixtureKg ? (
                  <tr>
                    <td className="py-2 px-3 font-semibold">Admixture Kimia</td>
                    <td className="py-2 px-3 text-right font-mono">{res.admixtureKg} kg</td>
                    <td className="py-2 px-3 text-right font-mono">{res.admixtureKg} kg</td>
                    <td className="py-2 px-3 text-right font-mono">{res.batchRequirements.admixtureKg} kg</td>
                  </tr>
                ) : null}
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2 px-3">TOTAL BERAT CAMPURAN</td>
                  <td className="py-2 px-3 text-right font-mono">{res?.theoreticalDensityKg} kg/m³</td>
                  <td className="py-2 px-3 text-right font-mono">-</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700">{res?.batchRequirements.totalBatchWeightKg} kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Moisture Correction Notes */}
          <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
            <h5 className="font-bold text-[#142D45] text-xs mb-1">Catatan Koreksi Kadar Air Agregat:</h5>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Air pencampur telah disesuaikan berdasarkan kondisi kadar air aktual agregat di lapangan (Pasir: {activeProject.fineAggregate.moistureContent}%, Kerikil: {activeProject.coarseAggregate.moistureContent}%).
              Air yang dimasukkan ke mixer adalah <strong>{res?.moistureCorrection.netWaterToBatchKg} kg/m³</strong> untuk menjaga rasio air-semen tepat pada <strong>fas = {res?.waterCementRatio}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
