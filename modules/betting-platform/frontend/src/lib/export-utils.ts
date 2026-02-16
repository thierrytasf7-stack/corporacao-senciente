export function exportToCSV(data: any, filename: string) {
  const csv = 
    Object.keys(data)
      .map(key => `${key},${data[key]}`)
      .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(content: string, filename: string) {
  const { jsPDF } = require('jspdf');
  const doc = new jsPDF();
  
  const lines = content.split('\n');
  lines.forEach((line, index) > {
    doc.text(line, 10, 10 + (index * 10));
  });
  
  doc.save(`${filename}.pdf`);
}