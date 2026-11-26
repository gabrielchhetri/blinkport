import type { Metadata } from "next";

import { JsonFormatter } from "@/components/tools/json-formatter";
import { UtilityToolPage } from "@/components/utility-tool-page";

export const metadata: Metadata = {
  title: "JSON Formatter and Validator",
  description:
    "Format, minify, and validate JSON in your browser. Find syntax errors and copy readable or compact output without uploading your data.",
  alternates: { canonical: "/tools/json-formatter" },
};

export default function JsonFormatterPage() {
  return (
    <UtilityToolPage
      guideTitle="Format JSON without sending it to a server"
      guide={
        <>
          <p>
            JSON must use double quotes around property names and string values. The formatter reports
            parsing errors from the browser so you can locate and correct invalid syntax.
          </p>
          <p>
            Formatting changes whitespace and indentation; it does not rename properties or convert
            values. Minified JSON remains JSON, just without unnecessary spaces and line breaks.
          </p>
        </>
      }
      intro="Make dense JSON easier to read, or minify valid data for compact output. Parsing and formatting happen locally in this browser."
      path="/tools/json-formatter"
      title="JSON formatter"
    >
      <JsonFormatter />
    </UtilityToolPage>
  );
}
