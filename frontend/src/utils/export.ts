import type { ProjectData, TelemetryFrame } from '../types/physics';

export function downloadProjectJson(project: ProjectData) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTelemetryCsv(frames: TelemetryFrame[], selectedObjectName?: string) {
  if (!frames || frames.length === 0) return;

  const headers = [
    'Time (s)',
    'Total KE (J)',
    'Total PE (J)',
    'Total Mechanical E (J)',
    'Collisions',
    'FPS'
  ];

  if (selectedObjectName) {
    headers.push(
      `${selectedObjectName} PosX (m)`,
      `${selectedObjectName} PosY (m)`,
      `${selectedObjectName} PosZ (m)`,
      `${selectedObjectName} VelX (m/s)`,
      `${selectedObjectName} VelY (m/s)`,
      `${selectedObjectName} VelZ (m/s)`,
      `${selectedObjectName} Speed (m/s)`,
      `${selectedObjectName} KE (J)`,
      `${selectedObjectName} PE (J)`
    );
  }

  const csvRows = [headers.join(',')];

  frames.forEach(frame => {
    const row = [
      frame.simTime.toFixed(3),
      frame.totalKE.toFixed(3),
      frame.totalPE.toFixed(3),
      frame.totalE.toFixed(3),
      frame.collisionCount,
      frame.fps
    ];

    if (selectedObjectName) {
      const objKey = Object.keys(frame.objectsData).find(
        k => k === selectedObjectName || frame.objectsData[k] !== undefined
      );
      const data = objKey ? frame.objectsData[objKey] : null;

      if (data) {
        row.push(
          data.pos.x.toFixed(3),
          data.pos.y.toFixed(3),
          data.pos.z.toFixed(3),
          data.vel.x.toFixed(3),
          data.vel.y.toFixed(3),
          data.vel.z.toFixed(3),
          data.speed.toFixed(3),
          data.ke.toFixed(3),
          data.pe.toFixed(3)
        );
      } else {
        row.push('0', '0', '0', '0', '0', '0', '0', '0', '0');
      }
    }

    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation_telemetry_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
