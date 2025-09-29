import { db } from "@/db";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function remove_user_from_tenant(
    request: NextRequest,
    user_id: number
) {
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

        if (user_id === user.id) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Cannot remove yourself",
                    null,
                    false
                ),
                { status: 400 }
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

        const user_tenant_relationship = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user_id),
                eq(UsersTenants.tenant_id, tenant_owned_by_user[0].id)
            ));

        if (!user_tenant_relationship) {
            return NextResponse.json(
                ApiResponse.response(
                    200,
                    "user id not part of tenant.",
                    null,
                    true
                ),
                {
                    status: 200
                }
            );
        }

        const deleted_relationship = await db
            .delete(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user_id),
                eq(UsersTenants.tenant_id, tenant_owned_by_user[0].tenant_id)
            ))
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                203,
                "successfully removed user.",
                deleted_relationship,
                true
            ),
            {
                status: 203
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

1. check user auth --> return 401 if not
2. check if user_id is same as user's id --> yes then return 400
3. check if tenant exist --> return 404
4. check if user is in tenant--> if not return 200
5. remove relationship
6. return 200 with relationship obj

*/