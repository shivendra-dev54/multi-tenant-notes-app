import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { UsersTenants } from "@/db/schemas/user_tenant.schema";
import { Tenants } from "@/db/schemas/tenant.schema";
import { Notes } from "@/db/schemas/note.schema";

export async function POST(request: NextRequest) {
    try {
        // 1. user auth check
        const userHeader = request.headers.get("x-user");
        const user = JSON.parse(userHeader!)?.data;
        if (!user) {
            return NextResponse.json(
                ApiResponse.response(401, "Unauthorized", null, false),
                { status: 401 }
            );
        }

        // 2. check body
        const { title, content, tenant_id } = await request.json();
        if (!title || !content || !tenant_id) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "title, content and tenant_id are required fields.",
                    null,
                    false
                ),
                { status: 400 }
            );
        }

        // 3. check if tenant exists
        const tenant = await db
            .select()
            .from(Tenants)
            .where(eq(Tenants.id, tenant_id));

        if (!tenant[0]) {
            return NextResponse.json(
                ApiResponse.response(404, "tenant not found.", null, false),
                { status: 404 }
            );
        }

        // 4. check if user belongs to tenant
        const userTenant = await db
            .select()
            .from(UsersTenants)
            .where(
                and(
                    eq(UsersTenants.user_id, user.id),
                    eq(UsersTenants.tenant_id, tenant_id)
                )
            );

        if (!userTenant[0]) {
            return NextResponse.json(
                ApiResponse.response(
                    403,
                    "user is not part of this tenant.",
                    null,
                    false
                ),
                { status: 403 }
            );
        }

        // 5. if free tenant, check notes count
        if (tenant[0].plan === "FREE") {
            const notesCount = await db
                .select()
                .from(Notes)
                .where(eq(Notes.tenantId, tenant_id));

            if (notesCount.length >= 10) {
                return NextResponse.json(
                    ApiResponse.response(
                        400,
                        "Free tenant can only have 10 notes.",
                        null,
                        false
                    ),
                    { status: 400 }
                );
            }
        }

        // 6. create note
        const newNote = await db
            .insert(Notes)
            .values({
                title,
                content,
                userId: user.id,
                tenantId: tenant_id,
            })
            .returning();

        // 7. return note
        return NextResponse.json(
            ApiResponse.response(
                200,
                "Note created successfully.",
                newNote[0],
                true
            ),
            { status: 200 }
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
            { status: 500 }
        );
    }
}

/*
LOGIC

1. if users not registered --> return.
2. check if body is present --> return 400 if not
3. check if tenant is present --> return 404 if not
4. if free tenant:
        1. check if notes are less that 10 --> if not return 400
5. create note 
6. return note 

*/