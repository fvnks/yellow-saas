import { query } from "@/api/lib/db";
import {
  successResponse,
  errorResponse,
} from "@/api/lib/helpers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/env";

const JWT_SECRET = getJwtSecret();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, remember } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // First check if this is a super admin
    const superAdminResult = await query(
      "SELECT id, email, name, password_hash, is_active FROM super_admins WHERE email = $1",
      [email]
    );

    if (superAdminResult.rows.length > 0) {
      const admin = superAdminResult.rows[0];

      if (!admin.is_active) {
        return errorResponse("Cuenta desactivada", 403);
      }
      if (!admin.password_hash) {
        return errorResponse("Cuenta sin contraseña configurada", 401);
      }

      const validPassword = await bcrypt.compare(password, admin.password_hash);
      if (!validPassword) {
        return errorResponse("Credenciales inválidas", 401);
      }

      await query("UPDATE super_admins SET last_login_at = now() WHERE id = $1", [
        admin.id,
      ]);

      const token = await new SignJWT({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role_type: "super_admin",
        role: "super_admin",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const maxAge = remember === false ? undefined : 7 * 24 * 60 * 60;
      const response = successResponse({
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role_type: "super_admin",
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
            name: admin.name,
            email: admin.email,
            role: "super_admin",
            role_type: "super_admin",
            company_id: null,
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
    }

    // Regular user login
    const result = await query(
      "SELECT id, email, full_name, company_id, role, password_hash FROM profiles WHERE email = $1 AND status = $2",
      [email, "active"]
    );

    if (result.rows.length === 0) {
      return errorResponse("Usuario no encontrado", 401);
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return errorResponse("Usuario sin contraseña", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return errorResponse("Contraseña incorrecta", 401);
    }

    // Fetch user's companies from user_companies table (with fallback)
    let companies: any[] = [];
    try {
      const companiesResult = await query(
        `SELECT uc.company_id, uc.role AS company_role, uc.is_default, c.name, c.slug, c.logo_url, c.plan, c.status
         FROM user_companies uc
         JOIN companies c ON c.id = uc.company_id
         WHERE uc.user_id = $1
         ORDER BY uc.is_default DESC, c.name ASC`,
        [user.id]
      );
      companies = companiesResult.rows;
    } catch {
      // user_companies table doesn't exist yet, fallback to profiles
      const fallbackResult = await query(
        `SELECT p.company_id, p.role AS company_role, true AS is_default, c.name, c.slug, c.logo_url, c.plan, c.status
         FROM profiles p
         JOIN companies c ON c.id = p.company_id
         WHERE p.id = $1 AND p.company_id IS NOT NULL`,
        [user.id]
      );
      companies = fallbackResult.rows;
    }

    // Use the user's company_id from profiles as the active company
    const activeCompanyId = user.company_id;
    const activeCompany =
      companies.find((c) => c.company_id === activeCompanyId) || companies[0];
    const userRole = activeCompany?.company_role || user.role;

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.full_name,
      company_id: activeCompanyId,
      role: userRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const maxAge = remember === false ? undefined : 7 * 24 * 60 * 60;
    const response = successResponse({
      company_id: activeCompanyId,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: userRole,
      },
      companies: companies.map((c) => ({
        id: c.company_id,
        name: c.name,
        slug: c.slug,
        logo_url: c.logo_url,
        plan: c.plan,
        status: c.status,
        role: c.company_role,
        is_default: c.is_default,
        is_active: c.company_id === activeCompanyId,
      })),
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
          role: userRole,
          company_id: activeCompanyId,
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
    console.error("Login error:", err);
    return errorResponse(
      err instanceof Error ? err.message : "Internal server error",
      500
    );
  }
}
