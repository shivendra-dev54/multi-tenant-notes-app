import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { TenantRequests } from "@/db/schemas/tenant_request.schema";

export async function GET(request: NextRequest) {
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

        const tenant_owned_by_user = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user.id),
                eq(UsersTenants.role, "Admin")
            ));

        if (!tenant_owned_by_user[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    404,
                    "tenant owned by user not found.",
                    null,
                    false
                ),
                {
                    status: 404
                }
            );
        }

        const user_requests = await db
            .select()
            .from(TenantRequests)
            .where(eq(TenantRequests.tenant_id, tenant_owned_by_user[0].tenant_id));

        return NextResponse.json(
            ApiResponse.response(
                200,
                "fetched all requests.",
                user_requests,
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

1. if users not registered --> return.
2. check if admin have any tenant --> if not return.
3. return all the requests.

*/