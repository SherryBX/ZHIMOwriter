export type PreviewNode =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; alt: string; src: string };

function isHeading(line: string) {
  return /^(#{1,3})\s+(.+)$/.exec(line);
}

function isQuote(line: string) {
  return /^>\s?(.+)$/.exec(line);
}

function isListItem(line: string) {
  return /^-\s+(.+)$/.exec(line);
}

function isImage(line: string) {
  return /^!\[([^\]]*)\]\((.+)\)$/.exec(line);
}

export function parseMarkdown(markdown: string): PreviewNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: PreviewNode[] = [];

  for (let index = 0; index < lines.length; ) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = isHeading(line);
    if (headingMatch) {
      nodes.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const imageMatch = isImage(line);
    if (imageMatch) {
      nodes.push({
        type: "image",
        alt: imageMatch[1].trim(),
        src: imageMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const quoteMatch = isQuote(line);
    if (quoteMatch) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const currentQuote = isQuote(current);
        if (!currentQuote) {
          break;
        }
        quoteLines.push(currentQuote[1].trim());
        index += 1;
      }

      nodes.push({
        type: "blockquote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    const listMatch = isListItem(line);
    if (listMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const currentListItem = isListItem(current);
        if (!currentListItem) {
          break;
        }
        items.push(currentListItem[1].trim());
        index += 1;
      }

      nodes.push({
        type: "list",
        items,
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || isHeading(current) || isQuote(current) || isListItem(current) || isImage(current)) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }

    if (paragraphLines.length > 0) {
      nodes.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      continue;
    }

    index += 1;
  }

  return nodes;
}
