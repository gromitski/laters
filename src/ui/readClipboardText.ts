type ClipboardReader = Pick<Clipboard, "readText">;

export async function readClipboardText(
  clipboard: ClipboardReader | undefined,
): Promise<string | undefined> {
  if (!clipboard) {
    return undefined;
  }

  try {
    return await clipboard.readText();
  } catch {
    return undefined;
  }
}
