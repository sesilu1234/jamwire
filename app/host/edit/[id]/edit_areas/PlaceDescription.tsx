import { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PlaceDescriptionProps } from "./types/types";

import dynamic from "next/dynamic";

import { Card, CardTitle } from "./ui";

const DraftEditor = dynamic(() => import("./textSlate"), {
	ssr: false,
});

export default function PlaceDescription({
	data,
	childSaveOnUnmount,
}: PlaceDescriptionProps) {
	const [text, setText] = useState("");

	return (
		<Card>
			<Toaster />
			<CardTitle
				title="Description"
				hint="What happens on the night, who it's for, house rules — keep it warm and short."
			/>
			<DraftEditor data={data} childSaveOnUnmount={childSaveOnUnmount} />
		</Card>
	);
}
