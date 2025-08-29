// utils/latex.js
export function transformLatexDelimiters(md = "") {
  // Tách theo code fence để tránh sửa trong khối code
  const parts = md.split(/(```[\s\S]*?```)/g);
  return parts
    .map((chunk) => {
      // nếu là code fence -> trả nguyên
      if (/^```/.test(chunk)) return chunk;

      // 1) Display math: \[ ... \]  ->  $$ ... $$
      chunk = chunk.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, p1) => {
        return `\n$$\n${p1}\n$$\n`; // xuống dòng giúp KaTeX block ổn định
      });

      // 2) Inline math: \( ... \)   ->  $ ... $
      chunk = chunk.replace(/\\\(([\s\S]*?)\\\)/g, (_m, p1) => {
        // loại bỏ khoảng trắng 2 đầu cho gọn
        return `$${p1.trim()}$`;
      });

      return chunk;
    })
    .join("");
}
