(function () {
  'use strict';
  if (window.__LSNN_BBCODE_INIT__) return;
  window.__LSNN_BBCODE_INIT__ = true;

  function stripAutoLinks(str) {
    return str.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1').trim();
  }

  function sanitizeUrl(url) {
    const clean = stripAutoLinks(url).replace(/["'<>]/g, '').trim();
    return /^(https?:\/\/|\/)/i.test(clean) ? clean : '#';
  }

  function parseBBCode(html) {
    if (!html || html.indexOf('[') === -1) return html;

    const heldBlocks = [];
    const holdBlock = (content) => {
      const token = `___LSNN_BB_BLK_${heldBlocks.length}___`;
      heldBlocks.push(content);
      return token;
    };

    // 1. Amankan blok <pre>/<code> bawaan Markdown
    html = html
      .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (m) => holdBlock(m))
      .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, (m) => holdBlock(m));

    // 2. Tangani tag [code]...[/code] sebelum pemrosesan lainnya
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (_, code) => {
      return holdBlock(`<pre><code>${code.trim()}</code></pre>`);
    });

    // 3. Bersihkan auto-link <a href> dari Markdown di dalam tag BBCode URL/Media
    html = html
      .replace(/\[url=([^\]]+)\]/gi, (_, u) => `[url=${stripAutoLinks(u)}]`)
      .replace(/\[(url|img|email|youtube)\]([\s\S]*?)\[\/\1\]/gi, (_, tag, inner) => {
        return `[${tag}]${stripAutoLinks(inner)}[/${tag}]`;
      });

    // 4. Amankan seluruh tag HTML existing (termasuk output lsnn-templates.js)
    const heldTags = [];
    html = html.replace(/<[^>]+>/g, (tag) => {
      const token = `___LSNN_BB_TAG_${heldTags.length}___`;
      heldTags.push(tag);
      return token;
    });

    // 5. Pemformatan teks dasar phpBB
    html = html
      .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
      .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
      .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
      .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<del>$1</del>')
      .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div style="text-align:center;">$1</div>');

    // 6. Warna & Ukuran persentase ala phpBB ([size=150])
    html = html.replace(/\[color=([#a-zA-Z0-9(),.\s%-]+)\]([\s\S]*?)\[\/color\]/gi, (_, color, text) => {
      const safeColor = color.replace(/[^#a-zA-Z0-9(),.\s%-]/g, '');
      return `<span style="color:${safeColor};">${text}</span>`;
    });

    html = html.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, (_, size, text) => {
      const val = Math.min(Math.max(parseInt(size, 10), 50), 300);
      return `<span style="font-size:${val}%;">${text}</span>`;
    });

    // 7. Nested Quote ([quote="Nama"] & [quote])
    let prev;
    do {
      prev = html;
      html = html
        .replace(/\[quote=(?:"|&quot;)?([^\]"&]+)(?:"|&quot;)?\]([\s\S]*?)\[\/quote\]/gi,
          '<blockquote class="lsnn-bbcode-quote"><cite>$1 wrote:</cite><div>$2</div></blockquote>')
        .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi,
          '<blockquote class="lsnn-bbcode-quote"><div>$1</div></blockquote>');
    } while (html !== prev);

    // 8. Spoiler ([spoiler=Judul] & [spoiler])
    html = html
      .replace(/\[spoiler=(?:"|&quot;)?([^\]"&]+)(?:"|&quot;)?\]([\s\S]*?)\[\/spoiler\]/gi,
        '<details class="lsnn-bbcode-spoiler"><summary>$1</summary><div class="lsnn-bbcode-spoiler-body">$2</div></details>')
      .replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
        '<details class="lsnn-bbcode-spoiler"><summary>Spoiler</summary><div class="lsnn-bbcode-spoiler-body">$1</div></details>');

    // 9. URL, Email, Gambar & YouTube
    html = html
      .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_, url, label) => {
        return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      })
      .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_, url) => {
        const clean = sanitizeUrl(url);
        return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>`;
      })
      .replace(/\[email\]([\s\S]*?)\[\/email\]/gi, (_, mail) => {
        const cleanMail = mail.replace(/[^a-zA-Z0-9@._+-]/g, '');
        return `<a href="mailto:${cleanMail}">${cleanMail}</a>`;
      })
      .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, (_, src) => {
        return `<img src="${sanitizeUrl(src)}" alt="Image" class="img-fluid" loading="lazy" />`;
      })
      .replace(/\[youtube\]([\s\S]*?)\[\/youtube\]/gi, (_, raw) => {
        const match = raw.match(/(?:v=|youtu\.be\/|embed\/)?([a-zA-Z0-9_-]{11})/);
        if (!match) return raw;
        return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:0.75rem 0;"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
      });

    // 10. Kembalikan tag HTML terlebih dahulu agar tag <br> di dalam [list] terbaca normal
    heldTags.forEach((tag, i) => {
      html = html.replace(`___LSNN_BB_TAG_${i}___`, () => tag);
    });

    // 11. List ([list], [list=1], [list=a])
    html = html.replace(/\[list(?:=(1|a))?\]([\s\S]*?)\[\/list\]/gi, (_, type, inner) => {
      const items = inner
        .split(/\[\*\]/i)
        .map((item) => item.replace(/^(?:<br\s*\/?>|\s)+|(?:<br\s*\/?>|\s)+$/gi, ''))
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join('');
      if (!items) return inner;
      if (type === '1') return `<ol>${items}</ol>`;
      if (type === 'a') return `<ol type="a">${items}</ol>`;
      return `<ul>${items}</ul>`;
    });

    // 12. Kembalikan blok <pre>/<code>
    heldBlocks.forEach((content, i) => {
      html = html.replace(`___LSNN_BB_BLK_${i}___`, () => content);
    });

    return html;
  }

  function processContainer(root) {
    const container = root || document;
    const targets = container.querySelectorAll(
      '[component="post/content"], [component="post/signature"], [component="composer"] .preview'
    );
    targets.forEach((el) => {
      const original = el.innerHTML;
      const parsed = parseBBCode(original);
      if (parsed !== original) {
        el.innerHTML = parsed;
      }
    });
  }

  if (window.$) {
    $(window).on('action:ajaxify.end action:posts.loaded', () => processContainer(document));
    $(window).on('action:composer.preview', () => {
      requestAnimationFrame(() => processContainer(document));
    });
  }

  processContainer(document);
})();
