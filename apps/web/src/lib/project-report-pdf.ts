import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ProjectReportData {
  project: {
    name: string;
    code: string;
    status: string;
    budget: number;
    progress: number;
    start_date: string;
    end_date: string;
    description: string;
  };
  tasks: any[];
  milestones: any[];
  expenses: any[];
  phases: any[];
  timesheets: any[];
}

export function generateProjectReportPDF(data: ProjectReportData): jsPDF {
  const doc = new jsPDF();
  const { project, tasks, milestones, expenses, phases, timesheets } = data;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(project.name, 15, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${project.code} | Reporte de Proyecto`, 15, 26);
  doc.setFontSize(8);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, 15, 32);

  let y = 45;

  // Status badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, 40, 8, 2, 2, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text(`Estado: ${project.status}`, 19, y + 5.5);
  y += 15;

  // Project Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Informacion del Proyecto', 15, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const info = [
    [`Presupuesto: $${(project.budget || 0).toLocaleString()}`, `Progreso: ${project.progress || 0}%`],
    [`Inicio: ${project.start_date || '—'}`, `Fin: ${project.end_date || '—'}`],
  ];

  for (const row of info) {
    doc.text(row[0], 15, y);
    doc.text(row[1], 110, y);
    y += 5;
  }

  if (project.description) {
    y += 3;
    doc.setFont('helvetica', 'italic');
    const lines = doc.splitTextToSize(project.description, 180);
    doc.text(lines.slice(0, 2), 15, y);
    y += lines.length * 4 + 3;
  }

  // Tasks summary
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`Tareas (${tasks.length})`, 15, y);
  y += 7;

  if (tasks.length > 0) {
    const taskStatus = {
      todo: tasks.filter((t: any) => t.status === 'todo').length,
      in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
      review: tasks.filter((t: any) => t.status === 'review').length,
      done: tasks.filter((t: any) => t.status === 'done').length,
    };

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Por Hacer: ${taskStatus.todo} | En Progreso: ${taskStatus.in_progress} | Revision: ${taskStatus.review} | Completadas: ${taskStatus.done}`, 15, y);
    y += 6;

    const taskRows = tasks.slice(0, 15).map((t: any) => [
      t.name?.substring(0, 30) || '',
      t.status || '',
      t.priority || '',
      t.assignee_name || '—',
      t.due_date || '—',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Tarea', 'Estado', 'Prioridad', 'Asignado', 'Vence']],
      body: taskRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
      },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Milestones
  if (milestones.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Hitos (${milestones.length})`, 15, y);
    y += 7;

    const milestoneRows = milestones.slice(0, 10).map((m: any) => [
      m.name?.substring(0, 35) || '',
      m.status || '',
      m.due_date || '—',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Hito', 'Estado', 'Fecha']],
      body: milestoneRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Expenses summary
  if (expenses.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Gastos (${expenses.length})`, 15, y);
    y += 7;

    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Total: $${totalExpenses.toLocaleString()}`, 15, y);
    y += 6;

    const expenseRows = expenses.slice(0, 10).map((e: any) => [
      e.type || '',
      e.description?.substring(0, 40) || '',
      `$${(parseFloat(e.amount) || 0).toLocaleString()}`,
      e.date || '',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Tipo', 'Descripcion', 'Monto', 'Fecha']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      margin: { left: 15, right: 15 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Phases
  if (phases.length > 0 && y < 240) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Fases (${phases.length})`, 15, y);
    y += 7;

    const phaseRows = phases.map((p: any) => [
      p.name || '',
      `$${(p.budget || 0).toLocaleString()}`,
      `$${(p.spent || 0).toLocaleString()}`,
      p.status || '',
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Fase', 'Presupuesto', 'Gastado', 'Estado']],
      body: phaseRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Yellow ERP | ${project.name} | Pagina ${i} de ${pageCount}`, 15, 290);
  }

  return doc;
}
