import { db } from "@/db";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userHeader = request.headers.get("x-user");
        if (!userHeader) {
            return NextResponse.json(
                ApiResponse.response(
                    401,
                    "Unauthorized",
                    null,
                    false
                ),
                { status: 401 }
            );
        }
        const user = JSON.parse(userHeader!)?.data;

        const tenant_user_part_of = await db
            .select()
            .from(UsersTenants)
            .where(eq(UsersTenants.user_id, user.id));

        return NextResponse.json(
            ApiResponse.response(
                200,
                "fetched users successfully.",
                tenant_user_part_of,
                true
            ),
            {
                status: 200
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
2. return user tenants
*/