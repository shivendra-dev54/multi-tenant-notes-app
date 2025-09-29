import { delete_note } from "@/controllers/delete_note.controller";
import { read_notes } from "@/controllers/read_note.controller";
import { update_note } from "@/controllers/update_note.controller";
import { NextRequest } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return delete_note(request, Number(params.id));
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return read_notes(request, Number(params.id));
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return update_note(request, Number(params.id));
}