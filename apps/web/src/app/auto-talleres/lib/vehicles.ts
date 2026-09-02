import { query } from '@/app/api/lib/db';

export async function getVehicles(filters?: {
  search?: string;
  marca?: string;
  clienteId?: string;
  page?: number;
  limit?: number;
  companyId?: string;
}) {
  const company_id = filters?.companyId || process.env.COMPANY_ID || '';
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClauses = ['v.company_id = $1'];
  const params: any[] = [company_id];
  let paramIndex = 2;
  
  if (filters?.search) {
    whereClauses.push(`(v.plate ILIKE $${paramIndex} OR v.brand ILIKE $${paramIndex} OR v.model ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }
  if (filters?.marca) {
    whereClauses.push(`v.brand = $${paramIndex++}`);
    params.push(filters.marca);
  }
  if (filters?.clienteId) {
    whereClauses.push(`v.client_id = $${paramIndex++}`);
    params.push(filters.clienteId);
  }
  
  const whereClause = whereClauses.join(' AND ');
  
  const countResult = await query(
    `SELECT COUNT(*) FROM auto_vehicles v WHERE ${whereClause}`,
    params
  );
  
  const { rows } = await query(
    `SELECT v.*, c.nombre as client_name, c.rut as client_rut, c.email, c.telefono
     FROM auto_vehicles v
     LEFT JOIN customers c ON c.id = v.client_id
     WHERE ${whereClause}
     ORDER BY v.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );
  
  return {
    vehicles: rows,
    total: parseInt(countResult.rows[0].count),
  };
}

export async function getVehicleById(id: string, companyId: string) {
  const { rows } = await query(
    `SELECT v.*, c.nombre as client_name, c.rut as client_rut, c.email, c.telefono
     FROM auto_vehicles v
     LEFT JOIN customers c ON c.id = v.client_id
     WHERE v.id = $1 AND v.company_id = $2`,
    [id, companyId]
  );
  
  return rows[0] || null;
}

export async function createVehicle(vehicle: {
  company_id: string;
  client_id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  tipo: string;
  tipo_combustible: string;
  transmision: string;
  kilometraje: number;
  motor: string;
  capacidad_tanque: number;
  vin?: string;
  observaciones?: string;
}) {
  const { rows } = await query(
    `INSERT INTO auto_vehicles (
      id, company_id, client_id, plate, brand, model, year, color,
      fuel_type, transmission, mileage, engine_capacity, vin, observation
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    ) RETURNING *`,
    [
      vehicle.company_id,
      vehicle.client_id,
      vehicle.patente,
      vehicle.marca,
      vehicle.modelo,
      vehicle.anio,
      vehicle.color,
      vehicle.tipo_combustible,
      vehicle.transmision,
      vehicle.kilometraje,
      vehicle.motor,
      vehicle.vin || null,
      vehicle.observaciones || null,
    ]
  );
  
  return rows[0];
}

export async function updateVehicle(id: string, updates: Partial<any>, companyId: string) {
  const setClauses = Object.keys(updates)
    .filter(key => updates[key] !== undefined)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');
  
  const values = [...Object.values(updates).filter(v => v !== undefined), id, companyId];
  
  const { rows } = await query(
    `UPDATE auto_vehicles SET ${setClauses}, updated_at = NOW() 
     WHERE id = $${values.length} AND company_id = $${values.length + 1} 
     RETURNING *`,
    values
  );
  
  return rows[0] || null;
}

export async function deleteVehicle(id: string, companyId: string) {
  await query(
    'DELETE FROM auto_vehicles WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
}
