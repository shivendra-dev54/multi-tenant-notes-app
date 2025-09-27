import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { Users } from "@/db/schemas/user.schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const refresh_token_old = request.cookies.get('refresh_token')?.value;

        const res = await db
            .select()
            .from(Users)
            .where(eq(Users.refresh_token, refresh_token_old!));


        await db
            .update(Users)
            .set({
                access_token: "",
                refresh_token: ""
            })
            .where(eq(Users.email, res[0]?.email))
            .returning();

        const response = NextResponse.json(
            ApiResponse.response(
                201,
                "logged out successfully.",
                {},
                true
            ),
            {
                status: 201
            }
        );

        response.cookies.set({
            name: 'access_token',
            value: "",
            httpOnly: true,
            path: '/',
            expires: new Date(0),
        });

        response.cookies.set({
            name: 'refresh_token',
            value: "",
            httpOnly: true,
            path: '/',
            expires: new Date(0),
        });

        return response;

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
