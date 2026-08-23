export interface ApplicationInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export async function requestApplicationInstall(
  installPrompt: ApplicationInstallPrompt,
): Promise<"accepted" | "dismissed"> {
  await installPrompt.prompt();
  return (await installPrompt.userChoice).outcome;
}
