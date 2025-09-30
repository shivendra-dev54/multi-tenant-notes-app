import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
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

        const tenants_user_part_of = await db
            .select()
            .from(UsersTenants)
            .where(eq(UsersTenants.user_id, user.id));

        const tenant_id_user_part_of = tenants_user_part_of.map((ele) => ele.tenant_id);

        const tenants = await db
            .select()
            .from(Tenants);

        const return_data = tenants.map((e) => {
            const tenant = { ...e, is_part_of: false }
            if (tenant_id_user_part_of.includes(e.id)) {
                tenant.is_part_of = true;
            }
            return tenant;
        });

        return NextResponse.json(
            ApiResponse.response(
                200,
                "tenants fetched",
                return_data,
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
2. find all tenants that user is part of
3. return tenants
*/