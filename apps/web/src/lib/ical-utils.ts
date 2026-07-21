export function generateProjectCalendarICS(
  milestones: any[],
  tasks: any[],
  projectName: string,
  projectCode: string
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yellow ERP//Project Calendar//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${projectName}`,
    'X-WR-TIMEZONE:America/Santiago',
  ];

  for (const milestone of milestones) {
    if (!milestone.due_date) continue;
    const dt = formatDateICS(milestone.due_date);
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:[Hito] ${milestone.name}`,
      `DESCRIPTION:Proyecto: ${projectName} (${projectCode})\\nEstado: ${milestone.status || 'pendiente'}`,
      `UID:${milestone.id}@yellow-erp`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  const tasksWithDates = tasks.filter((t: any) => t.due_date && t.status !== 'done' && t.status !== 'cancelled');
  for (const task of tasksWithDates) {
    const dt = formatDateICS(task.due_date);
    const priority = task.priority === 'urgent' ? '1' : task.priority === 'high' ? '3' : task.priority === 'medium' ? '5' : '9';
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dt}`,
      `SUMMARY:[Tarea] ${task.name}`,
      `DESCRIPTION:Proyecto: ${projectName}\\nPrioridad: ${task.priority || 'media'}\\nAsignado: ${task.assignee_name || 'sin asignar'}`,
      `UID:${task.id}@yellow-erp`,
      `PRIORITY:${priority}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatDateICS(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
