import * as argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { Users } from "@/db/schemas/user.schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();

        // validation
        if (!username || !username.trim()) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "Username is required",
                    null,
                    false),
                {
                    status: 400
                }
            );
        }

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

        const user_with_same_username = await db
            .select()
            .from(Users)
            .where(eq(Users.username, username));

        const user_with_same_email = await db
            .select()
            .from(Users)
            .where(eq(Users.email, email));

        if (user_with_same_username[0]?.username) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "user with same username exists.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        if (user_with_same_email[0]?.email) {
            return NextResponse.json(
                ApiResponse.response(
                    400,
                    "user with same email exists.",
                    null,
                    false
                ),
                {
                    status: 400
                }
            );
        }

        const hashed_pass = await argon2.hash(password);

        const res = await db
            .insert(Users)
            .values({
                username,
                email,
                password: hashed_pass
            })
            .returning();

        return NextResponse.json(
            ApiResponse.response(
                201,
                "User registered successfully",
                {
                    username: res[0].username,
                    email: res[0].email
                }
            ),
            {
                status: 201
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
