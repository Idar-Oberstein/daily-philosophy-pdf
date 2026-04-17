import "server-only";

import { put } from "@vercel/blob";

import { getConfig } from "@/lib/config";

export function isArchivePublishingEnabled() {
  const config = getConfig();
  return Boolean(config.BLOB_READ_WRITE_TOKEN);
}

export async function uploadEssayPdf(params: {
  pathname: string;
  pdfBuffer: Buffer;
}) {
  const config = getConfig();
  if (!config.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const blob = await put(params.pathname, params.pdfBuffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
    token: config.BLOB_READ_WRITE_TOKEN
  });

  return {
    url: blob.url,
    pathname: blob.pathname
  };
}
