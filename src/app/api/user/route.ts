import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
import { TenantRequests } from "@/db/schemas/tenant_request.schema";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const userHeader = request.headers.get("x-user");
        const user = JSON.parse(userHeader!)?.data;
        if (!user) {
            return NextResponse.json(
                ApiResponse.response(
                    401,
                    "Unauthorized",
                    user,
                    false
                ),
                { status: 401 }
            );
        }

        const { tenant_id } = await request.json();

        if (!tenant_id) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Tenant id is required field.",
                    null,
                    false
                ),
                { status: 400 }
            );
        }

        const tenant = await db
            .select()
            .from(Tenants)
            .where(eq(Tenants.id, tenant_id));

        if (!tenant[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    404,
                    "Tenant not found.",
                    null,
                    false
                ),
                { status: 404 }
            );
        }

        // to check if user is already part of tenant
        const user_tenant_relation = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user.id),
                eq(UsersTenants.tenant_id, tenant[0].id)
            ));

        if (user_tenant_relation[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "User is already a part of tenant.",
                    null,
                    false
                ),
                { status: 400 }
            );
        }

        const old_application = await db
            .select()
            .from(TenantRequests)
            .where(and(
                eq(TenantRequests.tenant_id, tenant[0].id),
                eq(TenantRequests.user_id, user.id)
            ))

        if (old_application[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "already requested to tenant.",
                    null,
                    false
                ),
                { status: 400 }
            );
        }

        // apply
        const application_to_tenant = await db
            .insert(TenantRequests)
            .values({
                tenant_id: tenant[0].id,
                user_id: user.id,
                status: "pending"
            })
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                200,
                "applied successfully.",
                application_to_tenant[0],
                true
            ),
            {
                status: 200
            }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            ApiResponse.response(
                500,
                "Internal server error",
                null,
                false
            ),
            {
                status: 500
            }
        );
    }
}

/* 
LOGIC

1. check if user is present --> else return
2. check body --> return if not present
3. check if tenant exist --> else return
4. check if user is present in tenant --> if yes then return 
5. check if already applied to tenant
6. apply
7. return response

*/