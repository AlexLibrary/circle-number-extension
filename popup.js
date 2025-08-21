const input = document.getElementById("number-input");
const styleSelect = document.getElementById("style-select");

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Картa Unicode-символов до 99
const circled = {};
for (let i = 1; i <= 20; i++) circled[i] = String.fromCharCode(9311 + i); // ①–⑳
for (let i = 21; i <= 35; i++)
  circled[i] = String.fromCharCode(0x3251 + (i - 21)); // ㉑ – ㉟

const parenthesized = {};
for (let i = 1; i <= 20; i++)
  parenthesized[i] = String.fromCharCode(0x2487 + i); // ⒈–⒛

// Храним оригинальный ввод
let rawValue = "";

function updateRawValue(event) {
  const selectionStart = input.selectionStart;
  const selectionEnd = input.selectionEnd;

  // Восстановим текст без заменённых символов
  const cleaned = input.value.replace(
    /[\u2460-\u2473\u3251-\u325F\u2488-\u249B]/g,
    (char) => {
      for (const [num, sym] of Object.entries(circled).concat(
        Object.entries(parenthesized)
      )) {
        if (sym === char) return num;
      }
      return "";
    }
  );

  rawValue = cleaned;
}

// Форматирование с проверкой на изоляцию
function formatInput(text, style) {
  const map = style === "circled" ? circled : parenthesized;

  return text.replace(/\b\d{1,2}\b/g, (match, offset, str) => {
    const num = parseInt(match, 10);

    // Если символы до и после — пробел или ничего
    const prev = str[offset - 1];
    const next = str[offset + match.length];

    const isIsolated =
      (!prev || /[\s.,;!?()\[\]{}"']/.test(prev)) &&
      (!next || /[\s.,;!?()\[\]{}"']/.test(next));

    return isIsolated && map[num] ? map[num] : match;
  });
}

const handleChange = debounce(() => {
  const style = styleSelect.value;

  // Используем rawValue, а не input.value
  const formatted = formatInput(rawValue, style);

  // Обновим поле
  input.value = formatted;
}, 300);

input.addEventListener("input", (e) => {
  updateRawValue(e);
  handleChange();
});
