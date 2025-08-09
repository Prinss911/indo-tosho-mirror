/**
 * Utilitas terpusat untuk pemformatan markdown
 * Menggabungkan fungsi formatDescription dan formatInlineElements
 * yang sebelumnya duplikat di berbagai halaman
 */

/**
 * Memformat elemen inline dalam teks markdown
 * @param text - Teks yang akan diformat
 * @returns Teks HTML yang telah diformat
 */
export const formatInlineElements = (text: string): string => {
    if (!text) return "";
    
    return (
        text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // Italic text
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            // Links
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
            )
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
    );
};

/**
 * Memformat deskripsi markdown lengkap dengan dukungan untuk berbagai elemen
 * @param text - Teks markdown yang akan diformat
 * @param options - Opsi pemformatan
 * @returns HTML yang telah diformat
 */
export const formatMarkdownDescription = (
    text: string,
    options: {
        enableCodeBlocks?: boolean;
        enableLists?: boolean;
        enableBlockquotes?: boolean;
        enableHorizontalRules?: boolean;
        enableLineBreaks?: boolean;
    } = {}
): string => {
    if (!text) return "";

    const {
        enableCodeBlocks = true,
        enableLists = true,
        enableBlockquotes = true,
        enableHorizontalRules = true,
        enableLineBreaks = true
    } = options;

    // Split text into lines for better processing
    const lines = text.split("\n");
    const processedLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBlockContent = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Handle code blocks
        if (enableCodeBlocks && line.trim().startsWith("```")) {
            if (inCodeBlock) {
                // End code block
                processedLines.push(
                    `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-4"><code>${codeBlockContent}</code></pre>`
                );
                codeBlockContent = "";
                inCodeBlock = false;
            } else {
                // Start code block
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent += (codeBlockContent ? "\n" : "") + line;
            continue;
        }

        // Handle unordered lists
        if (enableLists && line.trim().match(/^\* (.+)$/)) {
            if (!inUnorderedList) {
                if (inOrderedList) {
                    processedLines.push("</ol>");
                    inOrderedList = false;
                }
                processedLines.push('<ul class="list-disc list-inside space-y-1 my-4">');
                inUnorderedList = true;
            }
            const content = line.trim().replace(/^\* (.+)$/, "$1");
            processedLines.push(`<li class="ml-4">${formatInlineElements(content)}</li>`);
            continue;
        }

        // Handle ordered lists
        if (enableLists && line.trim().match(/^\d+\. (.+)$/)) {
            if (!inOrderedList) {
                if (inUnorderedList) {
                    processedLines.push("</ul>");
                    inUnorderedList = false;
                }
                processedLines.push('<ol class="list-decimal list-inside space-y-1 my-4">');
                inOrderedList = true;
            }
            const content = line.trim().replace(/^\d+\. (.+)$/, "$1");
            processedLines.push(`<li class="ml-4">${formatInlineElements(content)}</li>`);
            continue;
        }

        // Close lists if we're not in a list item
        if (inUnorderedList) {
            processedLines.push("</ul>");
            inUnorderedList = false;
        }
        if (inOrderedList) {
            processedLines.push("</ol>");
            inOrderedList = false;
        }

        // Handle horizontal rules
        if (enableHorizontalRules && line.trim() === "---") {
            processedLines.push('<hr class="my-4 border-gray-300 dark:border-gray-600">');
            continue;
        }

        // Handle blockquotes
        if (enableBlockquotes && line.trim().match(/^> (.+)$/)) {
            const content = line.trim().replace(/^> (.+)$/, "$1");
            processedLines.push(
                `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">${formatInlineElements(content)}</blockquote>`
            );
            continue;
        }

        // Handle regular paragraphs
        if (line.trim()) {
            processedLines.push(`<p class="mb-4">${formatInlineElements(line)}</p>`);
        } else {
            // Empty line - add spacing
            if (enableLineBreaks) {
                processedLines.push("<br>");
            }
        }
    }

    // Close any remaining lists
    if (inUnorderedList) {
        processedLines.push("</ul>");
    }
    if (inOrderedList) {
        processedLines.push("</ol>");
    }

    return processedLines.join("");
};

/**
 * Versi sederhana dari formatter markdown untuk kasus penggunaan yang lebih ringan
 * @param text - Teks markdown yang akan diformat
 * @returns HTML yang telah diformat
 */
export const formatSimpleMarkdown = (text: string): string => {
    if (!text) return "";

    return (
        text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // Italic text
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            // Links
            .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
            )
            // Code blocks
            .replace(
                /```([\s\S]*?)```/g,
                '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto"><code>$1</code></pre>'
            )
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-600">')
            // Unordered lists
            .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
            // Ordered lists
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
            // Blockquotes
            .replace(
                /^> (.+)$/gm,
                '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">$1</blockquote>'
            )
            // Line breaks
            .replace(/\n/g, "<br>")
    );
};

/**
 * Alias untuk kompatibilitas dengan kode yang sudah ada
 * @deprecated Gunakan formatMarkdownDescription sebagai gantinya
 */
export const formatDescription = formatMarkdownDescription;

/**
 * Type definitions untuk opsi pemformatan
 */
export interface MarkdownFormatterOptions {
    enableCodeBlocks?: boolean;
    enableLists?: boolean;
    enableBlockquotes?: boolean;
    enableHorizontalRules?: boolean;
    enableLineBreaks?: boolean;
}

/**
 * Konstanta untuk preset opsi pemformatan
 */
export const MARKDOWN_PRESETS = {
    FULL: {
        enableCodeBlocks: true,
        enableLists: true,
        enableBlockquotes: true,
        enableHorizontalRules: true,
        enableLineBreaks: true
    } as MarkdownFormatterOptions,
    
    SIMPLE: {
        enableCodeBlocks: false,
        enableLists: false,
        enableBlockquotes: false,
        enableHorizontalRules: false,
        enableLineBreaks: true
    } as MarkdownFormatterOptions,
    
    COMMENT: {
        enableCodeBlocks: true,
        enableLists: true,
        enableBlockquotes: true,
        enableHorizontalRules: false,
        enableLineBreaks: true
    } as MarkdownFormatterOptions
};