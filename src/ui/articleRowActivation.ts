export interface ArticleRowActivationContext {
  button: number;
  defaultPrevented: boolean;
  targetIsInteractive: boolean;
  hasSelectedText: boolean;
}

export function shouldActivateArticleRow(context: ArticleRowActivationContext): boolean {
  return (
    context.button === 0 &&
    !context.defaultPrevented &&
    !context.targetIsInteractive &&
    !context.hasSelectedText
  );
}
