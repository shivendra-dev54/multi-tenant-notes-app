import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function delete_tenant(request: NextRequest) {
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

        const tenant_user_own = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user.id),
                eq(UsersTenants.role, "Admin")
            ));

        if (!tenant_user_own[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "user does not own any tenant.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const deleted_tenant = await db
            .delete(Tenants)
            .where(eq(Tenants.id, tenant_user_own[0].tenant_id))
            .returning();

        await db
            .delete(UsersTenants)
            .where(eq(UsersTenants.tenant_id, tenant_user_own[0].tenant_id));

        // delete all notes in tenant here


        return NextResponse.json(
            ApiResponse.response(
                201,
                "successfully deleted the tenant.",
                deleted_tenant[0],
                true
            ),
            {
                status: 201
            }
        );

    }
    catch (error) {
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

1. if users not registered --> return
2. user does not have any tenant --> return 
3. remove tenant
4. remove all relations with that tenant
5. remove all notes in that tenant
6. return deleted tenant

*/