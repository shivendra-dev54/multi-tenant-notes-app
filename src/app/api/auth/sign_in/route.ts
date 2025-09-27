import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { Users } from "@/db/schemas/user.schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // validation
        if (!email || !email.trim()) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Email is required",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        if (!password || !password.trim()) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Password is required",
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
            .where(eq(Users.email, email));

        if (!res[0]?.username) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "user does not found.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const pass_from_db = res[0]?.password;

        const iscorrect = await argon2.verify(pass_from_db, password);

        if (!iscorrect) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Password is incorrect",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        };

        // handling cookies thing
        const access_token = jwt.sign({
            data: {
                id: res[0].id,
                username: res[0].username,
                email: res[0].email,
            }
        },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '1h' });

        const refresh_token = jwt.sign({
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
                access_token,
                refresh_token
            })
            .where(eq(Users.email, email))
            .returning();

        const response = NextResponse.json(
            ApiResponse.response(
                201,
                "User signed in successfully",
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
            value: access_token,
            httpOnly: true,
            path: '/',
        });

        response.cookies.set({
            name: 'refresh_token',
            value: refresh_token,
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
