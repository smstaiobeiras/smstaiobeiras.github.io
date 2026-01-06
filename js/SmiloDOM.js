// Core

{
    function createTag(name) {
        return function (properties,childrens) {
          let _properties = properties || {};
          if (Array.isArray(properties)){
            _properties = {childrenList : properties}
          }
          if (properties === null) {
            _properties = {childrenList: (typeof childrens === "object" ? childrens : [childrens])};
          }
          const el = document.createElement(name);
          if (typeof(properties) === "string") {
            if (properties.startsWith("#") || properties.startsWith(".")) {
              let selectors = properties.replaceAll(" ","").split(".").filter(s => s.length > 0);
              _properties = {classList: [], childrenList: (typeof childrens === "object" ? childrens : [childrens])};

              for (let selector of selectors) {
                if (selector.startsWith("#")) {
                  _properties.id = selector.slice(1);
                  continue;
                }
                _properties.classList.push(selector)
              }
            }
          }
          if (typeof(_properties) != "object") {
            el.appendChild(document.createTextNode(_properties));
            return el;
          }
          for (const [key, value] of Object.entries(_properties)) {
            let val = value;
            if (key === "childrenList") continue;
            if (key === "classList") {
              if (typeof value === "string") {
                el["className"] = value;
                continue;
              }
              el["className"] = value.join(" ");
              continue;
            }
            if (key === "style" && typeof val === "object") {
                Object.assign(el.style, val);
                continue;
            }
            if (typeof val === "function") {
              val = () => value();
            }
            if (key in el) {
                el[key] = val;
                continue;
            }
            el.setAttribute(key, val);
          }

          _properties.childrenList = (_properties.childrenList || (typeof childrens === "object" ? childrens : [childrens]));
          if (_properties.childrenList[0] === undefined) _properties.childrenList.shift();

          if (name == "img") {
            if (typeof childrens === "string" && el.src === "") {
              el.src = childrens;
              _properties.childrenList = [];
            }
          }
          

          _properties.childrenList.flat().forEach(child => {
            if (child instanceof Element) {
                el.appendChild(child);
                return;
            }
            el.appendChild(document.createTextNode(child));
          });

          return el;
        };
    }

    const htmlTags = [
        "a","abbr","address","area","article","aside","audio",
        "b","base","bdi","bdo","blockquote","body","br","button",
        "canvas","caption","cite","code","col","colgroup",
        "data","datalist","dd","del","details","dfn","dialog","div","dl","dt",
        "em","embed",
        "fieldset","figcaption","figure","footer","form",
        "h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html",
        "i","iframe","img","input","ins",
        "kbd",
        "label","legend","li","link",
        "main","map","mark","menu","meta","meter",
        "nav","noscript",
        "object","ol","optgroup","option","output",
        "p","picture","pre","progress",
        "q",
        "rp","rt","ruby",
        "s","samp","script","search","section","select","slot","small","source","span","strong","style","sub","summary","sup",
        "table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track",
        "u","ul",
        "var","video",
        "wbr"
    ];

    htmlTags.forEach(child => globalThis[child] = createTag(child));
    globalThis["createTag"] = createTag;
    globalThis["body"] = document.body;
    globalThis["head"] = document.body;
}
  

// Açúcares sintaticos
  
globalThis["hyperlink"] = (text,target) => {
  let childrenList = (Array.isArray(text) ? text : [text]);
  return a({
    href: target,
    childrenList: childrenList
  })
}

// Table
{
  globalThis["row"] = (list,tag) => {
    let childrenList = [];
    let cell = tag === "th" ? th : td;
    for (let item of list) {
      if (typeof item === "number") {
        childrenList.push(cell({
          style: {
            textAlign: 'right',
            textWrap: tag === "th" ? 'nowrap' : 'pretty',
          },
          childrenList: [item]
        }));
        continue;
      }
      childrenList.push(cell({
        style: {
          textWrap: tag === "th" ? 'nowrap' : 'pretty',
        },
        childrenList: [item]
      }));
    }
    return tr({
      childrenList: childrenList
    })
  }
  
  globalThis["table"] = (data,alt) => {
    if (typeof(data) === "string") {
      if (data.startsWith("#") || data.startsWith(".")) {
        return createTag("table")(data,alt);
      }
    }
    if (!Array.isArray(data)) return createTag("table")(data,alt);
    let childrenList = [];
    let headerList = [];
    let [header, ...list] = data;
  
    for (let item of list) {
      if (item instanceof Element) {
        childrenList.push(item);
        continue;
      }
      childrenList.push(row(item));
    }
  
    headerList.push(row(header,"th"))
  
    return createTag("table")({
      childrenList: [
        thead({childrenList: headerList}),
        tbody({childrenList: childrenList})
      ]
    });
  }
}

globalThis["field"] = (text, data,options) => {
  if (data.type === "checkbox") return label({
    childrenList: [
      input(data),
      text
    ]
  });

  if (data.type === "textarea") return label({
    childrenList: [
      text,
      textarea(data),
    ]
  });

  if (data.type === "select") {
    let _options = [];
    for (let [k,v] of Object.entries(options)) {
      _options.push(option({
        value: v,
        text: k
      }));
    }
    return label({
      childrenList: [
        text instanceof Element ? text : span(text),
        select(data,_options)
      ]
    });
  };

  return label({
    childrenList: [
      text instanceof Element ? text : span(text),
      input(data)
    ]
  });
};

globalThis["button"] = (text, onclick) => {
  if (typeof(text) === "string") {
    if (text.startsWith("#") || text.startsWith(".")) {
      return createTag("button")(text, onclick);
    }
  }

  if (!(typeof onclick === "function")) {
    return createTag("button")(text, onclick);
  }

  return createTag("button")({
    onclick: () => onclick(),
    childrenList: [
      text instanceof Element ? text : span(text),
    ]
  });
};

globalThis["reset"] = (text,onclick) => {
  let btn = button(text,onclick);
  btn.type = "reset";
  return btn;
}

globalThis["submit"] = (text,onclick) => {
  let btn = button(text,onclick);
  btn.type = "submit";
  return btn;
}

globalThis["details"] = (text, children) => {
  if (typeof(text) === "string") {
    if (text.startsWith("#") || text.startsWith(".")) {
      return createTag("details")(text, children);
    }
  }

  return createTag("details")({
    childrenList: [
      summary({childrenList: [text]}),
      ...(Array.isArray(children) ? children : children ? [p(children)] : "")]
  });
};

globalThis["img"] = (src, alt) => {
  if (typeof(src) === "string") {
    if (src.startsWith("#") || src.startsWith(".")) {
      return createTag("img")(src, alt);
    }
  }
  if (typeof src === "object") return createTag("img")(src, alt);
  return createTag("img")({
    src: src,
    alt: alt || ""
  });
};

globalThis["figure"] = (img, text) => {
  if (typeof(img) === "string") {
    if (img.startsWith("#") || img.startsWith(".")) {
      return createTag("figure")(img, text);
    }
  }

  return createTag("figure")({
    childrenList: [
      img instanceof Element ? img : createTag("img")({src: img}),
      text instanceof Element ? text : figcaption([text])
    ]
  });
};

globalThis["card"] = (properties) => {
  let data = {...properties};
  delete data.text;
  delete data.content;
  delete data.childrenList;
  delete data.style;

  let content = clone = properties.content.cloneNode(true);
  content.style.width = "96px";
  content.style.cursor = "pointer";
  delete content.alt;
  
  data.hover = true;
  data.style = {
    cursor: "pointer",
    width: "146px",
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
  };

  data.childrenList = [
    div({
      style: {
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        padding: "9px",
      },
      childrenList: [
        content
      ],
    }),
    div({
      style: {
        cursor: "pointer",
        borderTop: "1px solid",
        textAlign: "center",
        padding: "9px",
        fontWeight: "bold",
        backgroundColor: "var(--button-bg)",
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      },
      childrenList: [
        properties.text
      ],
    })
  ];

  let el = div(data)
  el.classList.add("card");
  return el;
}

globalThis["wrap"] = (childrenList) => {
  let container = div({
    style: {
      padding: "0px",
      display: "flex",
      flexWrap: "wrap",
      gap: "18px"
    }
  });

  for (child of (childrenList)) {
    container.appendChild(child);
  }

  return container;
}

globalThis["inline"] = (childrenList) => {
  let container = div({
    style: {
      padding: "0px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
      gap: "18px"
    }
  });

  for (child of (childrenList)) {
    container.appendChild(child);
  }

  return container;
}

globalThis["page"] = (descriptor) => {
  let section = document.createElement("section");
  section.setAttribute("x-title",descriptor.title);
  section.setAttribute("icon",descriptor.icon);
  section.style.display = "flex";
  section.style.gap = "18px";
  section.style.flexDirection = "column";


  for (child of (descriptor.body || [])) {
    section.appendChild(child);
  }

  return section;
}

globalThis["app"] = (pages) => {
  for (let page of pages) {
    document.querySelector("body > main > article").appendChild(page);
  }

  document.querySelectorAll("var").forEach((el) => el.textContent = (new URLSearchParams(window.location.search)).get(el.textContent) || '');
  document.querySelectorAll("body > main > article > section").forEach((el) => {
    let menuItem = document.querySelector("body > main > menu").appendChild(document.createElement("li"));
    menuItem.appendChild(document.createElement("img")).src = el.getAttribute("icon");
    menuItem.innerHTML += el.getAttribute("x-title");
    menuItem.onclick = () => {
      document.querySelectorAll("body > main > article > section").forEach((el) => el.style.display = "none");
      document.querySelectorAll("body > main > menu > li").forEach((el) => el.removeAttribute("selected"));
      el.style.display = "flex";
      menuItem.setAttribute("selected",true);
      document.body.removeAttribute("menu-open");
    }
    el.style.display = "none";
  });
  document.querySelector("body > main > menu > li")?.click();
}

{
  let colorMode = button({
    textContent: document.documentElement.hasAttribute("dark") ? "Modo claro" : "Modo escuro",
    style: {
      minWidth: "100px"
    },
    onclick: () => {
      if (document.documentElement.hasAttribute("dark")) {
        document.documentElement.removeAttribute("dark");
        event.target.textContent = "Modo escuro";
        localStorage.removeItem("darkMode");
        return;
      }
      document.documentElement.setAttribute("dark", "");
      event.target.textContent = "Modo claro";
      localStorage.setItem("darkMode",true);
    },
  });
  
  [...document.querySelectorAll("body > header > section")].at(-1).append(colorMode);
}

{
  let menu = document.querySelector("body > main > menu");

  let hamburguer = button({
    mobile: "",
    textContent: "☰",
    style: {
      padding: "0px",
      width: "32px",
      height: "32px",
    },
    onclick: () => document.body.setAttribute("menu-open", ""),
  });

  document.querySelector("body > header > section").prepend(hamburguer);

  document.addEventListener("click", (e) => {
    if (e.target == hamburguer) return;
    if (!menu.contains(e.target) || e.target == hamburguer) {
      document.body.removeAttribute("menu-open");
    }
  });
}