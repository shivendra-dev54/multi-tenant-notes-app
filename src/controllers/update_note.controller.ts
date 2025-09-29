import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { Notes } from "@/db/schemas/note.schema";

export async function update_note(request: NextRequest, noteId: number ) {
    try {
        const userHeader = request.headers.get("x-user");
        const user = JSON.parse(userHeader!)?.data;
        if (!user) {
            return NextResponse.json(ApiResponse.response(401, "Unauthorized", null, false), { status: 401 });
        }

        const { title, content } = await request.json();

        if (!title && !content) {
            return NextResponse.json(ApiResponse.response(400, "At least one field (title or content) required.", null, false), { status: 400 });
        }

        const note = await db.select().from(Notes).where(eq(Notes.id, noteId));
        if (!note[0]) {
            return NextResponse.json(ApiResponse.response(404, "Note not found.", null, false), { status: 404 });
        }

        if (note[0].userId !== user.id) {
            return NextResponse.json(ApiResponse.response(403, "Not allowed to update this note.", null, false), { status: 403 });
        }

        const updated = await db
            .update(Notes)
            .set({
                title: title ?? note[0].title,
                content: content ?? note[0].content,
                updatedAt: new Date()
            })
            .where(eq(Notes.id, noteId))
            .returning();

        return NextResponse.json(ApiResponse.response(200, "Note updated successfully.", updated[0], true), { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(ApiResponse.response(500, "Internal server error", null, false), { status: 500 });
    }
}
