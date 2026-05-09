import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportSeriesAsPDF(
  element: HTMLElement,
  filename: string = 'terramanga-series'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
}

export function downloadAsText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createCBZ(
  imageUrls: string[],
  filename: string = 'terramanga-chapter'
): Promise<void> {
  // CBZ is just a ZIP of images - we'll use a simple approach
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const imagePromises = imageUrls.map(async (url, i) => {
    const response = await fetch(url);
    const blob = await response.blob();
    zip.file(`page-${String(i + 1).padStart(3, '0')}.png`, blob);
  });

  await Promise.all(imagePromises);
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${filename}.cbz`;
  a.click();
  URL.revokeObjectURL(downloadUrl);
}
