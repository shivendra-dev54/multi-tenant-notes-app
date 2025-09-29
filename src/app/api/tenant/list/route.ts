import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextRequest, NextResponse } from "next/server";

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

        const tenant_list = await db
            .select()
            .from(Tenants);

        return NextResponse.json(
            ApiResponse.response(
                200,
                "successfully fetched all tenants",
                tenant_list.map(t => ({
                    id: t.id,
                    name: t.name,
                    plan: t.plan
                })),
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