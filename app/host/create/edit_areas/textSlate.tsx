"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Editor,
	EditorState,
	RichUtils,
	Modifier,
	convertToRaw,
	convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { DescriptionType } from "./types/types";
import { RefObject } from "react";
import { RawDraftContentState } from "draft-js";

import { useAtom } from "jotai";
import { formAtom } from "../store/jotai";
import { useFormStore } from "../store/formStore"; // path a tu store

const MAX_CHARS = 1400;

const EMOJIS = ["🔥", "❤️", "😂", "👍", "💎", "📅", "📍"];

interface DraftEditorProps {
	data: DescriptionType;
	childSaveOnUnmount: RefObject<() => void>;
}

const DraftEditor = ({ data, childSaveOnUnmount }: DraftEditorProps) => {
	const setForm = useFormStore((state) => state.setForm);

	const [editorState, setEditorState] = useState(
		data.description
			? EditorState.createWithContent(convertFromRaw(data.description))
			: EditorState.createEmpty(),
	);

	const [boldSelected, setBoldSelected] = useState(false);

	const [italicSelected, setItalicSelected] = useState(false);

	const editorStateRef = useRef(editorState);
	editorStateRef.current = editorState; // update every render

	function updateDataRef() {
		setForm((prev) => ({
			...prev,
			description: {
				description: convertToRaw(editorStateRef.current.getCurrentContent()),
			},
		}));
	}

	useEffect(() => {
		// eslint-disable-next-line react-hooks/immutability
		childSaveOnUnmount.current = updateDataRef;

		return () => {
			childSaveOnUnmount.current = () => {};
		};
	}, []);

	const handleChange = (state: EditorState) => {
		const contentLength = state.getCurrentContent().getPlainText("").length;
		if (contentLength > MAX_CHARS) {
			toast("Máximo 1400 caracteres", {
				description: "",
				action: {
					label: "Understood",
					onClick: () => console.log("Understood"),
				},
			});
			return; // don’t update state
		}
		setEditorState(state);
	};

	const handleKeyCommand = (command: string, state: EditorState) => {
		const newState = RichUtils.handleKeyCommand(state, command);
		if (newState) {
			handleChange(newState);
			return "handled";
		}
		return "not-handled";
	};

	const toggleInlineStyle = (style: "BOLD" | "ITALIC") => {
		handleChange(RichUtils.toggleInlineStyle(editorState, style));
	};

	const insertEmoji = (emoji: string) => {
		const contentState = editorState.getCurrentContent();
		const selection = editorState.getSelection();
		const newContent = Modifier.insertText(contentState, selection, emoji);
		const newEditorState = EditorState.push(
			editorState,
			newContent,
			"insert-characters",
		);
		handleChange(newEditorState);
	};

	const used = editorState.getCurrentContent().getPlainText("").length;
	const remaining = MAX_CHARS - used;

	return (
		<div className="flex flex-col gap-3">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-1.5">
				<button
					type="button"
					onMouseDown={(e) => {
						e.preventDefault();
						setBoldSelected((prev) => !prev);
						toggleInlineStyle("BOLD");
					}}
					className={`h-8 w-9 rounded-lg text-[14px] font-bold transition-colors cursor-pointer ${
						boldSelected
							? "bg-zinc-900 text-white"
							: "text-zinc-600 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
					}`}
				>
					B
				</button>
				<button
					type="button"
					onMouseDown={(e) => {
						e.preventDefault();
						setItalicSelected((prev) => !prev);
						toggleInlineStyle("ITALIC");
					}}
					className={`h-8 w-9 rounded-lg font-serif text-[15px] italic transition-colors cursor-pointer ${
						italicSelected
							? "bg-zinc-900 text-white"
							: "text-zinc-600 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
					}`}
				>
					I
				</button>

				<span className="mx-1 h-5 w-px bg-zinc-200" />

				{/* Emoji panel */}
				{EMOJIS.map((emoji) => (
					<button
						key={emoji}
						type="button"
						onMouseDown={(e) => {
							e.preventDefault();
							insertEmoji(emoji);
						}}
						className="h-8 w-8 rounded-lg text-[15px] leading-none transition-colors hover:bg-white hover:shadow-sm cursor-pointer"
					>
						{emoji}
					</button>
				))}
			</div>

			{/* Editor */}
			<div className="min-h-[320px] w-full rounded-xl border border-zinc-200 bg-white p-5 text-[15px] leading-relaxed text-zinc-800 transition-colors focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:min-h-[400px] sm:p-7">
				<Editor
					editorState={editorState}
					onChange={handleChange}
					handleKeyCommand={handleKeyCommand}
					placeholder="Start typing…"
				/>
			</div>

			<div className="flex justify-end">
				<span
					className={`text-[12px] font-medium tabular-nums ${
						remaining < 100 ? "text-amber-600" : "text-zinc-400"
					}`}
				>
					{remaining} characters remaining
				</span>
			</div>

			<Toaster />
		</div>
	);
};

export default DraftEditor;
