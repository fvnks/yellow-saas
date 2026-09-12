import { query, transaction } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);

    const assembliesRes = await query(
      `SELECT a.id, a.title, a.assembly_date as "assemblyDate", a.assembly_type as "assemblyType",
              a.quorum_required_pct as "quorumRequiredPct", a.status, a.minutes_text as "minutesText"
       FROM condos_assemblies a
       WHERE a.company_id = $1 AND a.property_id = $2
       ORDER BY a.assembly_date DESC`,
      [companyId, pParams.propertyId],
    );

    const assemblies = [];
    for (const a of assembliesRes.rows) {
      const topicsRes = await query(
        `SELECT t.id, t.title, t.description, t.is_voting as "isVoting", t.status
         FROM condos_assembly_topics t
         WHERE t.assembly_id = $1`,
        [a.id],
      );

      const topics = [];
      for (const t of topicsRes.rows) {
        const votesRes = await query(
          `SELECT vote_option, SUM(alicuota_pct) as total_alicuota, COUNT(*) as vote_count
           FROM condos_assembly_votes
           WHERE topic_id = $1
           GROUP BY vote_option`,
          [t.id],
        );
        topics.push({
          ...t,
          results: votesRes.rows.map((r: any) => ({
            option: r.vote_option,
            alicuotaPct: Number(r.total_alicuota) || 0,
            count: Number(r.vote_count) || 0,
          })),
        });
      }

      assemblies.push({
        ...a,
        topics,
      });
    }

    return successResponse(assemblies);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { action, title, assembly_date, assembly_type, quorum_required_pct, assembly_id, topic_title, description, topic_id, unit_id, vote_option } = body;

    if (action === 'vote') {
      if (!topic_id || !unit_id || !vote_option) return errorResponse("topic_id, unit_id and vote_option are required", 400);

      const result = await transaction(async (client) => {
        const uRes = await client.query(
          `SELECT COALESCE(c.coefficient_pct, c.percentage, 0) as alicuota
           FROM condos_units u
           LEFT JOIN condos_coefficients c ON c.unit_id = u.id AND c.category = 'general'
           WHERE u.id = $1 AND u.company_id = $2`,
          [unit_id, companyId],
        );
        const alicuotaPct = Number(uRes.rows[0]?.alicuota || 0);

        const vRes = await client.query(
          `INSERT INTO condos_assembly_votes (company_id, topic_id, unit_id, vote_option, alicuota_pct)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (topic_id, unit_id)
           DO UPDATE SET vote_option = EXCLUDED.vote_option, alicuota_pct = EXCLUDED.alicuota_pct
           RETURNING *`,
          [companyId, topic_id, unit_id, vote_option, alicuotaPct],
        );
        return vRes.rows[0];
      });

      return successResponse(result);
    }

    if (action === 'add_topic') {
      if (!assembly_id || !topic_title) return errorResponse("assembly_id and topic_title are required", 400);
      const tRes = await query(
        `INSERT INTO condos_assembly_topics (company_id, assembly_id, title, description, is_voting)
         VALUES ($1, $2, $3, $4, true)
         RETURNING *`,
        [companyId, assembly_id, topic_title, description || ''],
      );
      return successResponse(tRes.rows[0], 201);
    }

    // Default: Create assembly
    const aRes = await query(
      `INSERT INTO condos_assemblies (company_id, property_id, title, assembly_date, assembly_type, quorum_required_pct, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
       RETURNING *`,
      [companyId, pParams.propertyId, title || 'Asamblea Ordinaria', assembly_date || new Date().toISOString(), assembly_type || 'ordinary', Number(quorum_required_pct) || 50.0],
    );

    return successResponse(aRes.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
