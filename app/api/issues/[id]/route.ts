import { patchIssueSchema } from "@/app/validationSchemas";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// const session = await auth()
	// if (!session) return NextResponse.json({}, { status: 401 })

	const body = await request.json();
	const validation = patchIssueSchema.safeParse(body);
	if (!validation.success)
		return NextResponse.json(validation.error.errors, { status: 400 });

	if (body.assignedToUserId) {
		const user = await prisma.user.findUnique({
			where: { id: body.assignedToUserId }
		})
		if (!user) return NextResponse.json({ error: 'Inavlid user' }, { status: 400 })
	}

	const issue = await prisma.issue.findUnique({
		where: { id: parseInt(params.id) },
	});
	if (!issue)
		return NextResponse.json({ error: "Invalid Issue " }, { status: 404 });

	const updatedIssue = await prisma.issue.update({
		where: { id: issue.id },
		data: {
			title: body.title,
			description: body.description,
            status: body.status,
			assignedToUserId: body.assignedToUserId
		},
	});

	return NextResponse.json(updatedIssue);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const session = await auth()
	if (!session) return NextResponse.json({}, { status: 401 })

	const issue = await prisma.issue.findUnique({
		where: { id: parseInt(params.id) },
	});

	if (!issue)
		return NextResponse.json({ error: "Invalid issue" }, { status: 404 });

	await prisma.issue.delete({
		where: { id: issue.id },
	});

    return NextResponse.json({})
}
