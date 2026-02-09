const msg = document.getElementById("msg");
const warn = document.getElementById("warning");

const mergeColors = (str) => {
    let result = str;

    while (true) {
        const prev = result;

        result = result.replace(/\[c\/([0-9a-f]{6}):([^\]]+)\]\[c\/\1:([^\]]+)\]/gi, "[c/$1:$2$3]");
        if (prev === result) break;
    }

    return result;
};

const showWarning = (text) => {
    warn.textContent = text;
    warn.setAttribute("aria-hidden", "false");
    warn.style.display = "";

    setTimeout(() => {
        warn.setAttribute("aria-hidden", "true");
        warn.style.display = "none";
    }, 5000);
};

// Color
document.getElementById("colorBtn").onclick = () => {
    const start = msg.selectionStart;
    const end = msg.selectionEnd;

    if (start === end) return showWarning("Select text!");

    const before = msg.value.slice(0, start);
    const middle = msg.value.slice(start, end);
    const after = msg.value.slice(end);

    if (/\[c\//.test(middle) || /\[c\//.test(before.split("]").pop())) return showWarning("Color tags cannot be nested");

    const hex = document.getElementById("color").value.replace("#", "");

    msg.value = mergeColors(before + `[c/${hex}:${middle}]` + after);
};

// Item
document.getElementById("itemBtn").onclick = () => {
    const id = document.getElementById("itemId").value;
    if (!id) return showWarning("Item ID required");

    const prefix = document.getElementById("prefix").value;
    const stack = document.getElementById("stack").value;
    let tag = `[i/${prefix ? `p${prefix}/` : ""}${stack ? `s${stack}/` : ""}${id}]`;

    const pos = msg.selectionStart;

    msg.value = msg.value.slice(0, pos) + tag + msg.value.slice(pos);
};

// Gradient
const lerp = (start, end, t) => Math.round(start + (end - start) * t);
const rgb = (h) => ({ // hex 2 rgb
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16)
});

document.getElementById("gradBtn").onclick = () => {
    const start = msg.selectionStart;
    const end = msg.selectionEnd;

    if (start === end) return showWarning("Select text!");

    const sel = msg.value.slice(start, end);
    if (/\[/.test(sel)) return showWarning("Selection contains formatting");

    const first = rgb(document.getElementById("gradFrom").value);
    const second = rgb(document.getElementById("gradTo").value);

    let gradText = "";
    [...sel].forEach((ch, i, arr) => {
        const t = arr.length === 1 ? 0 : i / (arr.length - 1);
        const hex = ((lerp(first.r, second.r, t) << 16) | (lerp(first.g, second.g, t) << 8) | lerp(first.b, second.b, t)).toString(16).padStart(6, "0");

        gradText += `[c/${hex}:${ch}]`;
    });

    msg.value = msg.value.slice(0, start) + mergeColors(gradText) + msg.value.slice(end);
};
