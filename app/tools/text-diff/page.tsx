import type { Metadata } from "next";

import { TextDiff } from "@/components/tools/text-diff";
import { UtilityToolPage } from "@/components/utility-tool-page";

export const metadata: Metadata = {
  title: "Text Diff Checker",
  description:
    "Compare two text versions line by line in your browser. See added and removed lines without uploading or saving either version.",
  alternates: { canonical: "/tools/text-diff" },
};

export default function TextDiffPage() {
  return (
    <UtilityToolPage
      guideTitle="Compare two versions of text"
      guide={
        <>
          <p>
            This checker compares complete lines, so moving a sentence to another line can appear as a
            removal and an addition. Blank lines are included in the comparison.
          </p>
          <p>
            Each version is limited to 500 lines to keep the comparison responsive. For code review,
            larger projects, or collaborative changes, use a version-control diff designed for that work.
          </p>
        </>
      }
      intro="Paste an earlier and a newer version to see which lines were added, removed, or left unchanged."
      path="/tools/text-diff"
      title="Text diff checker"
    >
      <TextDiff />
    </UtilityToolPage>
  );
}
