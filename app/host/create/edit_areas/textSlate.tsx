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

	const editorRef = useRef<Editor>(null);

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

	/**
	 * Plain-text length of a state. Blocks are joined with a newline so the
	 * count matches the text that is actually stored — joining with "" used to
	 * undercount every paragraph break.
	 */
	const plainLength = (state: EditorState) =>
		state.getCurrentContent().getPlainText("\n").length;

	/**
	 * One toast, reused. Sonner replaces a toast that shares an id instead of
	 * stacking a new one, and the timestamp stops it re-firing on every
	 * keystroke once the editor is full.
	 */
	const lastWarnedAt = useRef(0);
	const warnFull = () => {
		const now = Date.now();
		if (now - lastWarnedAt.current < 1500) return;
		lastWarnedAt.current = now;
		toast.warning(`Maximum ${MAX_CHARS} characters`, {
			id: "description-char-limit",
		});
	};

	const handleChange = (state: EditorState) => {
		if (plainLength(state) > MAX_CHARS) {
			// Draft routes selection changes, undo and style toggles through this
			// same callback, so rejecting the state outright used to freeze the
			// editor rather than just refusing the extra characters. Keep the new
			// selection, keep the old content.
			warnFull();
			setEditorState(
				EditorState.acceptSelection(
					editorStateRef.current,
					state.getSelection(),
				),
			);
			return;
		}
		setEditorState(state);
	};

	/**
	 * Paste used to be all-or-nothing: with 400 characters left, pasting 600
	 * exceeded the limit so the *whole* paste was dropped and the editor claimed
	 * to be full while it still had room. Now it takes as much as fits.
	 */
	const handlePastedText = (text: string, _html: string | undefined, state: EditorState) => {
		const selection = state.getSelection();
		const selected = selection.isCollapsed()
			? 0
			: plainLength(state) - plainLength(
					EditorState.push(
						state,
						Modifier.removeRange(
							state.getCurrentContent(),
							selection,
							"backward",
						),
						"remove-range",
					),
			  );
		const room = MAX_CHARS - plainLength(state) + selected;
		if (room <= 0) {
			warnFull();
			return "handled" as const;
		}

		const slice = text.slice(0, room);
		if (slice.length < text.length) warnFull();

		const newContent = Modifier.replaceText(
			state.getCurrentContent(),
			selection,
			slice,
		);
		setEditorState(
			EditorState.push(state, newContent, "insert-characters"),
		);
		return "handled" as const;
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

	const used = plainLength(editorState);
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
			<div
				onMouseDown={(e) => {
					// Draft only focuses when the contenteditable itself is hit, so
					// clicking the padding around it did nothing — you had to land on
					// the placeholder text. Route clicks on the box to the editor.
					if (e.target === e.currentTarget) {
						e.preventDefault();
						editorRef.current?.focus();
					}
				}}
				className="min-h-[320px] w-full cursor-text rounded-xl border border-zinc-200 bg-white p-5 text-[15px] leading-relaxed text-zinc-800 transition-colors focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-900/5 sm:min-h-[400px] sm:p-7"
			>
				<Editor
					ref={editorRef}
					editorState={editorState}
					onChange={handleChange}
					handleKeyCommand={handleKeyCommand}
					handlePastedText={handlePastedText}
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

		</div>
	);
};

export default DraftEditor;
