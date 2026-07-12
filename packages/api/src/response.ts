import { z } from 'zod';

export const createApiResponse = <T>(data: T, meta?: Record<string, unknown>) => ({
  success: true as const,
  data,
  meta,
});

export const createApiError = (message: string, code: string, status: number = 400, details?: unknown) => ({
  success: false as const,
  error: { message, code, status, details },
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
    status: z.number().int(),
    details: z.unknown().optional(),
  }),
});

export type ApiResponse<T> = { success: true; data: T; meta?: Record<string, unknown> };
export type ApiError = { success: false; error: { message: string; code: string; status: number; details?: unknown } };
export type PaginatedResponse<T> = { success: true; data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };