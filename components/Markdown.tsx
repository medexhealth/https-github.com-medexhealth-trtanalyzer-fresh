import React from 'react';

export const Markdown = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    const processInline = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    for (const line of lines) {
        if (line.trim().startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 class="text-xl font-bold text-blue-300 mt-6 mb-3">${processInline(line.trim().substring(4))}</h3>`;
        } else if (line.trim().startsWith('- ')) {
            if (!inList) { html += '<ul class="space-y-2 mt-2 list-outside">'; inList = true; }
            html += `<li class="ml-5 list-disc">${processInline(line.trim().substring(2))}</li>`;
        } else if (line.trim().length > 0) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p>${processInline(line.trim())}</p>`;
        }
    }

    if (inList) { html += '</ul>'; }

    return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: html }} />;
};
