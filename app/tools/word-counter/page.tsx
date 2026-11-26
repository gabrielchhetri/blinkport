import type { Metadata } from "next";

import { WordCounter } from "@/components/tools/word-counter";
import { UtilityToolPage } from "@/components/utility-tool-page";

export const metadata: Metadata = {
  title: "Word and Character Counter",
  description:
    "Count words, characters, characters without spaces, and lines as you type. Text stays in your browser and is not saved.",
  alternates: { canonical: "/tools/word-counter" },
};

export default function WordCounterPage() {
  return (
    <UtilityToolPage
      guideTitle="Count words and characters as you write"
      guide={
        <>
          <p>
            Words are groups of text separated by whitespace. Character totals count Unicode code
            points, and the no-spaces total removes whitespace characters before counting.
          </p>
          <p>
            Line totals count each non-empty input line, including lines created by pressing Enter.
            Pasting and editing stay on this page and do not create a share.
          </p>
        </>
      }
      intro="Check the length of a draft, message, or snippet with live word, character, and line totals."
      path="/tools/word-counter"
      title="Word counter"
    >
      <WordCounter />
    </UtilityToolPage>
  );
}
