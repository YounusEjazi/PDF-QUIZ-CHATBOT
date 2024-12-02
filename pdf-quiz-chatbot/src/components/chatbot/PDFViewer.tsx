"use client";

import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${encodeURIComponent(
        pdf_url
      )}&embedded=true`}
      className="w-full h-full"
      title="PDF Viewer"
    ></iframe>
  );
};

export default PDFViewer;
