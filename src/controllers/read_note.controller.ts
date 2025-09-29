import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { Notes } from "@/db/schemas/note.schema";
import { Tenants } from "@/db/schemas/tenant.schema";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";

export async function read_notes(request: NextRequest, tenantId: number ) {
    try {
        const userHeader = request.headers.get("x-user");
        const user = JSON.parse(userHeader!)?.data;
        if (!user) {
            return NextResponse.json(ApiResponse.response(401, "Unauthorized", null, false), { status: 401 });
        }

        const tenant = await db.select().from(Tenants).where(eq(Tenants.id, tenantId));
        if (!tenant[0]) {
            return NextResponse.json(ApiResponse.response(404, "Tenant not found.", null, false), { status: 404 });
        }

        const membership = await db
            .select()
            .from(UsersTenants)
            .where(and(eq(UsersTenants.user_id, user.id), eq(UsersTenants.tenant_id, tenantId)));

        if (!membership[0]) {
            return NextResponse.json(ApiResponse.response(403, "User not part of tenant.", null, false), { status: 403 });
        }

        const notes = await db.select().from(Notes).where(eq(Notes.tenantId, tenantId));

        return NextResponse.json(ApiResponse.response(200, "Notes fetched successfully.", notes, true), { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
