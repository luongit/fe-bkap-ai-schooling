export const getLangIcon = (className = '') => {
    // Extract language from className (e.g. language-html -> html)
    const match = className.match(/language-([\w\d]+)/i);
    const lang = match ? match[1].toLowerCase() : '';

    switch (lang) {
        case 'js':
        case 'javascript':
            return '🟨 JS';
        case 'py':
        case 'python':
            return '🐍 Python';
        case 'java':
            return '☕ Java';
        case 'html':
            return '🌐 HTML';
        case 'css':
            return '🎨 CSS';
        case 'json':
            return '📦 JSON';
        case 'sql':
            return '📦 SQL';
        case 'bash':
        case 'sh':
            return '💻 Bash';
        case 'php':
            return '🐘 PHP';
        case 'c':
        case 'cpp':
            return '🔧 C/C++';
        case 'ts':
        case 'typescript':
            return '🔷 TS';
        case 'csharp':
            return '🟪 C#';
        default:
            return lang.toUpperCase() || 'CODE';
    }
};

export const extractText = (children) => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractText).join('');
    if (typeof children === 'object' && children?.props?.children) {
        return extractText(children.props.children);
    }
    return '';
};

export const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    speechSynthesis.speak(utterance);
};
