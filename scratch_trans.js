const fs = require('fs');
let code = fs.readFileSync('panchangam-v18.js', 'utf8');

const newFunc = unction applyTransliteration() {
    const target = document.getElementById('scriptSelect').value;
    if (!window.Sanscript) return;
    
    const elements = document.querySelectorAll('.akshara');
    elements.forEach(el => {
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) {
            let text = node.nodeValue;
            if (text.trim() !== '') {
                if (target === 'telugu') {
                    text = Sanscript.t(text, 'devanagari', 'telugu');
                } else {
                    text = Sanscript.t(text, 'devanagari', target);
                    text = Sanscript.t(text, 'telugu', target);
                }
                node.nodeValue = text;
            }
        }
    });
};

code = code.replace(/function applyTransliteration\(\) \{[\s\S]*?\n\}/, newFunc);
fs.writeFileSync('panchangam-v18.js', code);
console.log('Replaced!');
