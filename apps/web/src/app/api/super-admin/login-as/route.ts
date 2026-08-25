import { query } from "@/api/lib/db";
import { successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";
import { verifySuperAdmin } from "@/api/super-admin/lib/auth";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/env";

const JWT_SECRET = getJwtSecret();

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse("No autorizado", 401);

  const body = await request.json();
  const { company_id, user_id } = body;

  if (!company_id || !user_id)
    return errorResponse("company_id y user_id son requeridos", 400);

  try {
    const userResult = await query(
      "SELECT id, email, full_name, role, company_id FROM profiles WHERE id = $1 AND company_id = $2",
      [user_id, company_id]
    );

    if (userResult.rows.length === 0) return errorResponse("Usuario no encontrado", 404);

    const user = userResult.rows[0];

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
      company_id: user.company_id,
      impersonated: true,
      impersonated_by: admin.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("4h")
      .sign(JWT_SECRET);

    await query(
      "INSERT INTO access_audit_log (super_admin_id, company_id, action, details) VALUES ($1, $2, 'access', $3)",
      [admin.id, company_id, JSON.stringify({ action: "login_as", target_user: user.email })]
    );

    const maxAge = 4 * 60 * 60;
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      },
    });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    response.cookies.set(
      "yellow-profile",
      Buffer.from(
        JSON.stringify({
          name: user.full_name,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
          impersonated: true,
        })
      ).toString("base64url"),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      }
    );
    return response;
  } catch (err) {
    console.error("Login as error:", err);
    return errorResponse("Error al impersonar usuario", 500);
  }
}
