import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";

export async function update_tenant(request: NextRequest) {
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

        const { name, desc } = await request.json();

        if (!name || !desc) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "tenant name and desc are required fields.",
                    null,
                    false
                ),
                {
                    status: 400
                }
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

        const tenant_with_same_name = await db
            .select()
            .from(Tenants)
            .where(eq(Tenants.name, name));

        if (
            tenant_with_same_name[0] &&
            (tenant_with_same_name[0].id !== user_tenant[0].tenant_id)
        ) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "tenant with same name exists.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const updated_tenant = await db
            .update(Tenants)
            .set({
                name,
                description: desc
            })
            .where(eq(Tenants.id, user_tenant[0].tenant_id))
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                203,
                "updated successfully.",
                updated_tenant[0],
                true
            ),
            {
                status: 203
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
2. body not present --> return
3. if new name tenant already exist --> return
4. if user does not own any tenant -- return
5. update tenant
6. return updated info

*/