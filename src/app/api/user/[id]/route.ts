import { db } from "@/db";
import { Notes } from "@/db/schemas/note.schema";
import { Tenants } from "@/db/schemas/tenant.schema";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/tenant/:id
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userHeader = request.headers.get("x-user");
        const user = JSON.parse(userHeader!)?.data;

        if (!user) {
            return NextResponse.json(
                ApiResponse.response(401, "Unauthorized", null, false),
                { status: 401 }
            );
        }

        const tenant_id = parseInt(params.id);

        if (!tenant_id) {
            return NextResponse.json(
                ApiResponse.response(400, "Tenant id is required.", null, false),
                { status: 400 }
            );
        }

        const tenant = await db
            .select()
            .from(Tenants)
            .where(eq(Tenants.id, tenant_id));

        if (!tenant[0]) {
            return NextResponse.json(
                ApiResponse.response(404, "Tenant not found.", null, false),
                { status: 404 }
            );
        }

        // check if user is part of tenant
        const user_tenant_relation = await db
            .select()
            .from(UsersTenants)
            .where(
                and(
                    eq(UsersTenants.user_id, user.id),
                    eq(UsersTenants.tenant_id, tenant_id)
                )
            );

        if (!user_tenant_relation[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "User is not a part of this tenant.",
                    user_tenant_relation,
                    false
                ),
                { status: 400 }
            );
        }

        // delete relation
        await db
            .delete(UsersTenants)
            .where(
                and(
                    eq(UsersTenants.user_id, user.id),
                    eq(UsersTenants.tenant_id, tenant[0].id)
                )
            );

        await db
            .delete(Notes)
            .where(eq(Notes.tenantId, tenant[0].id));

        return NextResponse.json(
            ApiResponse.response(200, "Left tenant successfully.", null, true),
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            ApiResponse.response(500, "Internal server error", null, false),
            { status: 500 }
        );
    }
}


/* 
LOGIC

1. Check if user is present in headers → else return 401.
2. Check tenant_id (from URL param) → else return 400.
3. Check if tenant exists → else return 404.
4. Check if user is part of the tenant → if not, return 400.
5. Delete the user-tenant relation.
6. delete all notes created by user in that tenant.
6. Return success response.
*/