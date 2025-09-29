import { NextRequest } from "next/server";
import { respond_to_req } from "@/controllers/respond_request.controller";
import { remove_user_from_tenant } from "@/controllers/remove_user.controller";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const req_id = parseInt(params.id);
    return respond_to_req(
        request,
        req_id
    );
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const user_id = parseInt(params.id);
    return remove_user_from_tenant(
        request,
        user_id
    );
}