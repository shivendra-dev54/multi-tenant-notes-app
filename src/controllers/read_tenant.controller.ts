import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";

export async function read_tenant(request: NextRequest) {
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

        const user_tenant = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user.id),
                eq(UsersTenants.role, "Admin")
            ));

        if (!user_tenant[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    404,
                    "Tenant not found, create one.",
                    null,
                    false
                ),
                { status: 404 }
            );
        }

        return NextResponse.json(
            ApiResponse.response(
                200,
                "successfully fetched tenants.",
                user_tenant[0],
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

1. if users not registered --> return
2. user don't own any tenant --> return
3. return tenant info

*/