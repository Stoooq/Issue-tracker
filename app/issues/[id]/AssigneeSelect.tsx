"use client";

import { Issue, User } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/app/components";
import toast, { Toaster } from "react-hot-toast";

interface Props {
	issue: Issue;
}

const AssigneeSelect = ({ issue }: Props) => {
	const {
		data: users,
		error,
		isLoading,
	} = useUsers()

	if (isLoading) return <Skeleton />;

	if (error) return null;

    const assignIssue = async (userId: string) => {
        try {
            await axios.patch("/api/issues/" + issue.id, {
                assignedToUserId: userId === "unassigned" ? null : userId,
            });
        } catch (error) {
            toast.error("Changes could not be saved.");
        }
    }

	return (
		<>
			<Select.Root
				defaultValue={issue.assignedToUserId || ""}
				onValueChange={assignIssue}
			>
				<Select.Trigger placeholder="Assign..." />
				<Select.Content>
					<Select.Group>
						<Select.Label>Suggestions</Select.Label>
						<Select.Item value="unassigned">Unassigned</Select.Item>
						{users?.map((user) => (
							<Select.Item key={user.id} value={user.id}>
								{user.name}
							</Select.Item>
						))}
					</Select.Group>
				</Select.Content>
			</Select.Root>
			<Toaster />
		</>
	);
};

const useUsers = () => useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => axios.get("/api/users").then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
});

export default AssigneeSelect;
