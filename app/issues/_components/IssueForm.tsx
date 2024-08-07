"use client";

import { ErrorMessage, Spinner } from "@/app/components";
import { issueSchema } from "@/app/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Issue } from "@prisma/client";
import { Button, Callout, RadioGroup, TextField } from "@radix-ui/themes";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import SimpleMDE from "react-simplemde-editor";

type IssueFormData = z.infer<typeof issueSchema>;

interface Props {
	issue?: Issue;
}

const IssueForm = ({ issue }: Props) => {
	const router = useRouter();
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<IssueFormData>({
		resolver: zodResolver(issueSchema),
	});
	const [error, setError] = useState("");
	const [isSubmitting, setSubmitting] = useState(false);

	const onSubmit = handleSubmit(async (data) => {
		try {
			setSubmitting(true);
			if (issue) await axios.patch("/api/issues/" + issue.id, data);
			else await axios.post("/api/issues", data);
			router.push("/issues");
			router.refresh();
		} catch (error) {
			setSubmitting(false);
			setError("An unexpected error occured");
		}
	});

	return (
		<div className="max-w-xl ">
			{error && (
				<Callout.Root color="red" className="mb-5">
					<Callout.Text>{error}</Callout.Text>
				</Callout.Root>
			)}
			<form className="space-y-3" onSubmit={onSubmit}>
				<TextField.Root
					defaultValue={issue?.title}
					placeholder="Title"
					{...register("title")}
				/>
				<ErrorMessage>{errors.title?.message}</ErrorMessage>
				<Controller
					name="description"
					defaultValue={issue?.description}
					control={control}
					render={({ field }) => (
						<SimpleMDE placeholder="Description" {...field} />
					)}
				/>
				<ErrorMessage>{errors.description?.message}</ErrorMessage>
				{issue && (
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<RadioGroup.Root {...field} defaultValue={issue?.status}>
								<RadioGroup.Item value="OPEN">Open</RadioGroup.Item>
								<RadioGroup.Item value="IN_PROGRESS">
									In Progress
								</RadioGroup.Item>
								<RadioGroup.Item value="CLOSED">Closed</RadioGroup.Item>
							</RadioGroup.Root>
						)}
					/>
				)}
				<Button disabled={isSubmitting}>
					{issue ? "Update Issue" : "Submit New Issue"}{" "}
					{isSubmitting && <Spinner />}
				</Button>
			</form>
		</div>
	);
};

export default IssueForm;
