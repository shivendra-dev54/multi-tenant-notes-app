import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { Users } from "@/db/schemas/user.schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const refresh_token_old = request.cookies.get('refresh_token')?.value || "";

        if (!refresh_token_old || !refresh_token_old.trim()) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "cookies not found.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const res = await db
            .select()
            .from(Users)
            .where(eq(Users.refresh_token, refresh_token_old));

        if (!res[0]?.username || !res[0]?.username?.trim()) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "cookies does not match to DB.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        // handling cookies thing
        const access_token_new = jwt.sign({
            data: {
                id: res[0].id,
                username: res[0].username,
                email: res[0].email,
            }
        },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '1h' });

        const refresh_token_new = jwt.sign({
            data: {
                id: res[0].id,
                username: res[0].username,
                email: res[0].email,
            }
        },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' });


        const res_cookie = await db
            .update(Users)
            .set({
                access_token: access_token_new,
                refresh_token: refresh_token_new
            })
            .where(eq(Users.email, res[0].email))
            .returning();

        const response = NextResponse.json(
            ApiResponse.response(
                201,
                "cookies refreshed successfully",
                {
                    username: res_cookie[0].username,
                    email: res_cookie[0].email
                }
            ),
            {
                status: 201
            }
        );

        response.cookies.set({
            name: 'access_token',
            value: access_token_new,
            httpOnly: true,
            path: '/',
        });

        response.cookies.set({
            name: 'refresh_token',
            value: refresh_token_new,
            httpOnly: true,
            path: '/',
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
