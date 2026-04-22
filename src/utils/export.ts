import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

interface ExportData {
  title: string;
  fields: Record<string, boolean>;
  reportMode?: 'sui' | 'internal';
  dateRange?: string;
  kpiData?: Record<string, any>;
  financialData?: { compras: number; ventas: number; margen: number; margenPct: number };
  materialsData?: { name: string; kg: number; percentage: number }[];
  recyclersData?: { name: string; kg: number; routes: number }[];
  suiData?: { label: string; value: string }[];
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString('es-CO')}`;
}

export async function exportCSV(data: ExportData, filename: string) {
  let csv = `Reporte: ${data.title}\n\n`;
  if (data.dateRange) {
    csv += `Rango: ${data.dateRange}\n`;
  }
  if (data.reportMode) {
    csv += `Modo: ${data.reportMode === 'sui' ? 'SUI' : 'Interno'}\n`;
  }
  csv += '\n';

  if (data.reportMode === 'sui' && data.suiData?.length) {
    csv += 'Campos requeridos SUI\n';
    csv += 'Campo,Valor\n';
    data.suiData.forEach((row) => {
      csv += `"${row.label}","${row.value}"\n`;
    });
    csv += '\n';
  }

  if (data.fields.kpi && data.kpiData) {
    csv += "Métricas Globales (KPIs)\n";
    Object.entries(data.kpiData).forEach(([key, val]) => {
      csv += `"${key}","${val}"\n`;
    });
    csv += "\n";
  }

  if (data.fields.financial && data.financialData) {
    csv += "Comparativo Compras / Ventas\n";
    csv += "Concepto,Valor (COP)\n";
    csv += `"Compras a Recicladores","${data.financialData.compras}"\n`;
    csv += `"Ventas al Mercado","${data.financialData.ventas}"\n`;
    csv += `"Margen Operativo","${data.financialData.margen}"\n`;
    csv += `"Margen (%)","${data.financialData.margenPct}%"\n`;
    csv += "\n";
  }

  if (data.fields.materials && data.materialsData) {
    csv += "Distribución por Material\n";
    csv += "Material,Cantidad (kg),Porcentaje (%)\n";
    data.materialsData.forEach(m => {
      csv += `"${m.name}","${m.kg}","${m.percentage}%"\n`;
    });
    csv += "\n";
  }

  if (data.fields.recyclers && data.recyclersData) {
    csv += "Top Recicladores\n";
    csv += "Nombre,Cantidad (kg),Rutas\n";
    data.recyclersData.forEach(r => {
      csv += `"${r.name}","${r.kg}","${r.routes}"\n`;
    });
    csv += "\n";
  }

  await downloadFile(csv, filename + '.csv', 'text/csv');
}

export function generatePDFHtml(data: ExportData): string {
  let writtenSummary = '';
  if (data.kpiData && data.financialData) {
    const marginStatus = data.financialData.margenPct > 15 ? 'saludable' : 'ajustado';
    writtenSummary = `
      <div class="summary-box">
        <h3>Resumen Ejecutivo</h3>
        <p>
          Durante el período evaluado, la ECA ha operado con un volumen de recolección de <strong>${data.kpiData['Material Recolectado'] || data.kpiData['kg Recolectados']}</strong>.
          Las ventas totales al mercado alcanzaron <strong>${formatCurrency(data.financialData.ventas)}</strong>,
          mientras que los pagos a recicladores de oficio sumaron <strong>${formatCurrency(data.financialData.compras)}</strong>.
        </p>
        <p>
          Esto resultó en un margen operativo del <strong>${data.financialData.margenPct}%</strong> (${formatCurrency(data.financialData.margen)}),
          lo cual representa un nivel <strong>${marginStatus}</strong> para la sostenibilidad operativa del centro de acopio.
        </p>
      </div>
    `;
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${data.title}</title>
      <style>
        @page { margin: 20px; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #0f172a; background: #fff; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #059669; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
        .header p { color: #64748b; margin: 5px 0 0 0; font-size: 14px; }

        .summary-box { background-color: #f8fafc; border-left: 4px solid #059669; padding: 20px; margin-bottom: 30px; border-radius: 4px; }
        .summary-box h3 { margin-top: 0; color: #0f172a; font-size: 16px; text-transform: uppercase; margin-bottom: 10px; }
        .summary-box p { font-size: 14px; color: #334155; margin-bottom: 10px; text-align: justify; }
        .summary-box p:last-child { margin-bottom: 0; }

        h2 { color: #0f172a; font-size: 18px; margin-top: 40px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }

        .kpi-grid { display: flex; gap: 15px; margin-bottom: 30px; }
        .kpi-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 5px; }
        .kpi-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
        th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 15px; text-align: left; }
        th { background-color: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; }
        tr:nth-child(even) { background-color: #f8fafc; }

        .chart-container { margin-bottom: 30px; }
        .bar-row { display: flex; align-items: center; margin-bottom: 12px; }
        .bar-label { width: 160px; font-size: 13px; color: #334155; font-weight: bold; }
        .bar-track { flex: 1; background: #e2e8f0; height: 16px; border-radius: 8px; overflow: hidden; margin: 0 15px; }
        .bar-fill { height: 100%; }
        .bar-value { width: 80px; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold; }

        .financial-bars { display: flex; justify-content: center; gap: 40px; align-items: flex-end; height: 220px; margin-top: 20px; padding-bottom: 20px; border-bottom: 1px solid #cbd5e1; }
        .fin-col { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 120px; }
        .fin-bar { width: 80px; border-radius: 6px 6px 0 0; text-align: center; color: white; font-size: 12px; font-weight: bold; padding-top: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .fin-label { margin-top: 15px; font-size: 12px; font-weight: bold; color: #475569; text-align: center; }
        .fin-val { margin-bottom: 8px; font-size: 16px; font-weight: bold; color: #0f172a; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <p>Generado automáticamente por ECA App — ZipaRecicla</p>
        ${data.dateRange ? `<p>Rango: ${data.dateRange}</p>` : ''}
        ${data.reportMode ? `<p>Modo: ${data.reportMode === 'sui' ? 'SUI' : 'Interno'}</p>` : ''}
      </div>

      ${writtenSummary}
  `;

  if (data.reportMode === 'sui' && data.suiData?.length) {
    html += `<h2>Campos requeridos SUI</h2><table><tr><th>Campo</th><th>Valor reportado</th></tr>`;
    data.suiData.forEach((row) => {
      html += `<tr><td><strong>${row.label}</strong></td><td>${row.value}</td></tr>`;
    });
    html += `</table>`;
  }

  if (data.fields.kpi && data.kpiData) {
    html += `<h2>Métricas Globales</h2><div class="kpi-grid">`;
    Object.entries(data.kpiData).forEach(([key, val]) => {
      html += `<div class="kpi-card"><div class="kpi-value">${val}</div><div class="kpi-label">${key}</div></div>`;
    });
    html += `</div>`;
  }

  if (data.fields.financial && data.financialData) {
    const fin = data.financialData;
    const maxVal = Math.max(fin.compras, fin.ventas);
    const comprasHeight = Math.max((fin.compras / maxVal) * 100, 10);
    const ventasHeight = Math.max((fin.ventas / maxVal) * 100, 10);
    const margenHeight = Math.max((fin.margen / maxVal) * 100, 10);

    html += `
      <h2>Análisis Financiero Gráfico</h2>
      <div class="chart-container">
        <div class="financial-bars">
          <div class="fin-col">
            <div class="fin-val">${formatCurrency(fin.compras)}</div>
            <div class="fin-bar" style="height: ${comprasHeight}%; background-color: #ea580c;"></div>
            <div class="fin-label">Compras a<br>Recicladores</div>
          </div>
          <div class="fin-col">
            <div class="fin-val">${formatCurrency(fin.margen)}</div>
            <div class="fin-bar" style="height: ${margenHeight}%; background-color: #059669;">${fin.margenPct}%</div>
            <div class="fin-label">Margen<br>Operativo</div>
          </div>
          <div class="fin-col">
            <div class="fin-val">${formatCurrency(fin.ventas)}</div>
            <div class="fin-bar" style="height: ${ventasHeight}%; background-color: #2563eb;"></div>
            <div class="fin-label">Ventas al<br>Mercado</div>
          </div>
        </div>
      </div>
      <h2>Tabla de Resumen Financiero</h2>
      <table>
        <tr><th>Concepto</th><th>Valor Bruto (COP)</th><th>Participación (%)</th></tr>
        <tr><td><strong>Ventas al Mercado (Ingreso)</strong></td><td><strong>${formatCurrency(fin.ventas)}</strong></td><td><strong>100%</strong></td></tr>
        <tr><td>Compras a Recicladores (Costo)</td><td>${formatCurrency(fin.compras)}</td><td>${Math.round((fin.compras/fin.ventas)*100)}%</td></tr>
        <tr style="background: #f0fdf4;"><td><strong>Margen Operativo (Beneficio)</strong></td><td><strong>${formatCurrency(fin.margen)}</strong></td><td><strong>${fin.margenPct}%</strong></td></tr>
      </table>
    `;
  }

  if (data.fields.materials && data.materialsData) {
    html += `<h2>Distribución por Material (Gráfico)</h2><div class="chart-container">`;
    data.materialsData.forEach(m => {
      const color = m.percentage > 30 ? '#059669' : m.percentage > 15 ? '#2563eb' : '#94a3b8';
      html += `
        <div class="bar-row">
          <div class="bar-label">${m.name}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${m.percentage}%; background-color: ${color};"></div>
          </div>
          <div class="bar-value">${m.percentage}%</div>
        </div>
      `;
    });
    html += `</div><h2>Tabla de Materiales</h2><table><tr><th>Clasificación del Material</th><th>Volumen Recolectado (kg)</th><th>Cuota de Participación (%)</th></tr>`;
    data.materialsData.forEach(m => {
      html += `<tr><td><strong>${m.name}</strong></td><td>${m.kg.toLocaleString('es-CO')} kg</td><td>${m.percentage}%</td></tr>`;
    });
    html += `</table>`;
  }

  if (data.fields.recyclers && data.recyclersData) {
    html += `<h2>Top Recicladores del Período</h2><table><tr><th>Posición Ranking</th><th>Nombre del Reciclador</th><th>Volumen Aportado (kg)</th><th>Rutas Completadas</th></tr>`;
    data.recyclersData.forEach((r, idx) => {
      const medal = idx === 0 ? '🥇 1º (Líder)' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`;
      html += `<tr><td><strong>${medal}</strong></td><td>${r.name}</td><td>${r.kg.toLocaleString('es-CO')} kg</td><td>${r.routes} rutas</td></tr>`;
    });
    html += `</table>`;
  }

  html += `
      <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        Documento oficial generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}. <br>
        Plataforma ECA App — ZipaRecicla.
      </div>
    </body>
    </html>
  `;

  return html;
}

export async function exportPDF(data: ExportData, filename: string) {
  const html = generatePDFHtml(data);

  if (Platform.OS === 'web') {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 100);
      }
    } catch (e) {
      console.error('Error printing PDF in web:', e);
      throw e;
    }
  } else {
    try {
      const { uri } = await Print.printToFileAsync({ html });
      const newUri = FileSystem.documentDirectory + filename + '.pdf';
      await FileSystem.copyAsync({ from: uri, to: newUri });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (e) {
      console.error('Error saving PDF:', e);
      throw e;
    }
  }
}

async function downloadFile(content: string, filename: string, mimeType: string) {
  if (Platform.OS === 'web') {
    const encodedUri = 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    try {
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { UTI: mimeType === 'text/csv' ? 'public.comma-separated-values-text' : undefined, mimeType });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
