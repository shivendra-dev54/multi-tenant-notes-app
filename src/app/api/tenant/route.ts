import { NextRequest } from "next/server";
import { create_tenant } from "@/controllers/create_tenant.controller";
import { read_tenant } from "@/controllers/read_tenant.controller";
import { update_tenant } from "@/controllers/update_tenant.controller";
import { delete_tenant } from "@/controllers/delete_tenant.controller";

export async function POST(request: NextRequest) {
    return create_tenant(request);
}

export async function GET(request: NextRequest) {
    return read_tenant(request);
}

export async function PUT(request: NextRequest) {
    return update_tenant(request);
}

export async function DELETE(request: NextRequest) {
    return delete_tenant(request);
}