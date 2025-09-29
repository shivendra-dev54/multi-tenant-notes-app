import { db } from "@/db";
import { TenantRequests } from "@/db/schemas/tenant_request.schema";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { ApiResponse } from "@/utils/ApiResponse";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function respond_to_req(
    request: NextRequest,
    req_id: number
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

        const { response } = await request.json();

        if (!response || !req_id) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "response field is required in body.",
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

        const request_to_be_processed = await db
            .select()
            .from(TenantRequests)
            .where(eq(TenantRequests.id, req_id));

        if (!request_to_be_processed[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    404,
                    "request not found.",
                    null,
                    false
                ),
                {
                    status: 404
                }
            );
        }


        await db
            .delete(TenantRequests)
            .where(eq(TenantRequests.id, request_to_be_processed[0].id));

        if (response === "accept") {
            const user_tenant_relationship = await db
                .insert(UsersTenants)
                .values({
                    user_id: request_to_be_processed[0].user_id,
                    tenant_id: tenant_owned_by_user[0].id,
                    role: "Member"
                })
                .returning();

            await db
                .delete(TenantRequests)
                .where(eq(TenantRequests.id, request_to_be_processed[0].id));

            return NextResponse.json(
                ApiResponse.response(
                    200,
                    "added user to tenant.",
                    user_tenant_relationship,
                    true
                ),
                {
                    status: 200
                }
            );
        }
        else {
            return NextResponse.json(
                ApiResponse.response(
                    200,
                    "rejected request from user.",
                    null,
                    true
                ),
                {
                    status: 200
                }
            );
        }



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
2. check if body is present --> if not return
3. check if user have any tenant --> if not return 
4. check if request is present in DB --> if not return
5. add user tenant relationship
6. delete request
7. return relationship object
*/