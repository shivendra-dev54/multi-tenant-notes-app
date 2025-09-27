import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { db } from "@/db";
import { Tenants } from "@/db/schemas/tenant.schema";
import { and, eq } from "drizzle-orm";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";

export async function create_tenant(request: NextRequest) {
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

        const tenant_with_same_name = await db
            .select()
            .from(Tenants)
            .where(eq(Tenants.name, name));

        if (tenant_with_same_name[0]) {
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

        const user_tenant = await db
            .select()
            .from(UsersTenants)
            .where(and(
                eq(UsersTenants.user_id, user.id),
                eq(UsersTenants.role, "Admin")
            ));

        if (user_tenant[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "user can create single tenant only.",
                    {
                        tenant_id: user_tenant[0].tenant_id,
                        user_id: user_tenant[0].user_id,
                        role: user_tenant[0].role,
                    },
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const new_tenant = await db
            .insert(Tenants)
            .values({
                name,
                description: desc
            })
            .returning();

        const user_tenant_relation = await db
            .insert(UsersTenants)
            .values({
                user_id: user.id,
                tenant_id: new_tenant[0].id,
                role: "Admin"
            })
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                200,
                "successfully created new tenant.",
                {
                    tenant: new_tenant[0],
                    relation: user_tenant_relation
                },
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
2. body not present --> return
3. tenant with same name exist --> return
4. user already own a tenant --> return 
5. create tenant 
6. add Admin role to Usertenant table 
7. return tenant info

*/