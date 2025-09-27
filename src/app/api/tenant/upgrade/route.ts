import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
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
                    404,
                    "tenant not found, create one.",
                    null,
                    false
                ),
                {
                    status: 404
                }
            );
        }

        const upgraded_tenant = await db
            .update(Tenants)
            .set({
                plan: "Pro"
            })
            .where(eq(Tenants.id, tenant_user_own[0].tenant_id))
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                201,
                "Upgraded tenant to Pro.",
                upgraded_tenant[0],
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

1. check user auth --> return if not
2. check if user own any tenant --> return if not
3. upgrade tenant to pro
4. return the tenant
*/