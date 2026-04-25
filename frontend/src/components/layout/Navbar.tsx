import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BsBarChartLine,
  BsBoxArrowUpRight,
  BsPlusSquare,
  BsSpeedometer2,
  BsTable,
  BsTranslate,
  BsSticky,
  BsFileEarmarkRuled,
  BsPeople,
} from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";

import { useAppContext } from "../../context/AppContext";
import { getLink } from "../../lib/api";

type NavItem = {
  key: string;
  label: string;
  modeBase: string;
  forceMode?: "OS";
};

const NAV_ITEMS: NavItem[] = [
  { key: "create", label: "Create RFQ", modeBase: "Create" },
  { key: "draft", label: "Drafts", modeBase: "Draft" },
  { key: "list", label: "RFQ List", modeBase: "List" },
  { key: "vendor", label: "Vendor List", modeBase: "Vendor", forceMode: "OS" },
];

const RFQ_SHEET_LINKS = [
  {
    label: "RFQ List (KR)",
    href: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=0#gid=0",
  },
  {
    label: "RFQ List (OS)",
    href: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=36461421#gid=36461421",
  },
  {
    label: "Vendor List",
    href: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=1004620658#gid=1004620658",
  },
  {
    label: "Country Code",
    href: "https://docs.google.com/spreadsheets/d/1pWFTXnpKhO6VOzHT7KsjrUPxmKFwfQdlatTKmWvTjUk/edit?gid=263916741#gid=263916741",
  },
];

function navIconFor(key: NavItem["key"]): JSX.Element {
  const common = "h-[14px] w-[14px]";

  if (key === "create") {
    return <BsPlusSquare className={common} />;
  }
  if (key === "dash") {
    return <BsSpeedometer2 className={common} />;
  }
  if (key === "status") {
    return <BsBarChartLine className={common} />;
  }
  if (key === "draft") {
    return <BsSticky className={common} />;
  }
  if (key === "list") {
    return <BsFileEarmarkRuled className={common} />;
  }
  if (key === "vendor") {
    return <BsPeople className={common} />;
  }
  return <BsTable className={common} />;
}

function getCurrentMode(pathname: string): string {
  const cleanPath = pathname.replace(/^\/+/, "");
  return cleanPath || "index";
}

function buildInternalHref(mode: string): string {
  if (mode.toLowerCase() === "index") {
    return "/index";
  }
  return `/${mode.toLowerCase()}`;
}

function buildNavMode(item: NavItem): string {
  return item.modeBase;
}

function isActiveMode(currentMode: string, item: NavItem): boolean {
  return currentMode.toLowerCase() === item.modeBase.toLowerCase();
}

function faviconFor(url: string): string {
  if (url.includes("docs.google.com/spreadsheets")) {
    return "https://ssl.gstatic.com/docs/spreadsheets/spreadsheets_2023q4.ico";
  }
  return `https://s2.googleusercontent.com/s2/favicons?sz=64&domain=${url}`;
}

type NavbarProps = {
  currentMode?: string;
};

export function Navbar({
  currentMode: currentModeProp,
}: NavbarProps): JSX.Element {
  const location = useLocation();
  const { rfqMode, setRfqMode, lang, setLang } = useAppContext();
  const currentMode = currentModeProp ?? getCurrentMode(location.pathname);
  const [isExpanded, setIsExpanded] = useState(false);
  const [navRfqMode, setNavRfqMode] = useState<"KR" | "OS">(rfqMode);
  const [externalLinks, setExternalLinks] = useState<string[][]>([]);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageMenuFocused, setLanguageMenuFocused] = useState(false);
  const [linksMenuOpen, setLinksMenuOpen] = useState(false);
  const [linksMenuFocused, setLinksMenuFocused] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const linksMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNavRfqMode(rfqMode);
  }, [rfqMode]);

  useEffect(() => {
    let isMounted = true;

    getLink()
      .then((data) => {
        if (isMounted) {
          setExternalLinks(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load external links:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(target)
      ) {
        setLanguageMenuOpen(false);
      }
      if (linksMenuRef.current && !linksMenuRef.current.contains(target)) {
        setLinksMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.key === "vendor") {
          return navRfqMode === "OS";
        }
        return true;
      }),
    [navRfqMode],
  );

  function handleRfqModeChange(nextMode: "KR" | "OS"): void {
    setNavRfqMode(nextMode);
  }

  function handleNavItemClick(item: NavItem): void {
    setRfqMode(item.forceMode ?? navRfqMode);
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-9998 flex h-screen flex-col justify-between whitespace-nowrap bg-[#3d3d43] text-white shadow-[5px_10px_10px_rgba(0,0,0,0.25)] transition-all duration-600 ease py-2.5 ${
        isExpanded
          ? "w-60 rounded-tr-[50px]"
          : "w-15 rounded-tr-[50px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setNavRfqMode(rfqMode);
        setLanguageMenuOpen(false);
        setLanguageMenuFocused(false);
        setLinksMenuOpen(false);
        setLinksMenuFocused(false);
      }}
    >
      <div className="flex h-[calc(100%-40px)] flex-col items-center overflow-hidden">
        <div className="mb-1 w-full px-0">
          <Link
            to={buildInternalHref("index")}
            className="flex items-center justify-center font-['Quattrocento_Sans'] text-[28px] no-underline p-3 hover:no-underline"
          >
            <img
              className="shrink-0 object-contain size-8.75"
              src="https://i.postimg.cc/2qPmbrwS/insta-Quote-logo-final.png"
              alt="instaQuote"
            />
            <div
              className={`overflow-hidden text-[28px] font-semibold leading-none transition-all duration-500 ${
                isExpanded
                  ? "ml-1.75 max-w-40 opacity-100"
                  : "ml-0 max-w-0 opacity-0"
              }`}
            >
              <span className="text-white">insta</span>
              <span className="text-[#9270ff]">Quote</span>
            </div>
          </Link>
        </div>

        <div
          className={`relative inline-block h-9 rounded-[20px] border p-0.5 text-sm transition-all duration-400 ease my-2.5 ${
            isExpanded
              ? "mx-auto w-24.5 border-white/50 inset-x-0"
              : navRfqMode === "OS"
                ? "right-11.5 w-13 border-[#3d3d43]"
                : "w-13 border-[#3d3d43]"
          }`}
        >
          <div
            className={`absolute top-0.5 h-7.5 w-11.5 rounded-[20px] bg-white transition-all duration-300 ease-in ${
              navRfqMode === "KR" ? "left-0.5" : "left-12"
            }`}
          />
          {(["KR", "OS"] as const).map((mode) => (
            <label
              key={mode}
              className={`relative z-10 m-0 inline-flex h-7.5 w-11.5 cursor-pointer items-center justify-center rounded-[20px] border-none bg-transparent p-0 transition-colors text-xs/7.5 ${
                navRfqMode === mode
                  ? "text-[#475562]"
                  : isExpanded
                    ? "text-white/50"
                    : "text-[#475562]"
              }`}
            >
              <input
                checked={navRfqMode === mode}
                className="sr-only"
                name="rfqMode"
                onChange={() => handleRfqModeChange(mode)}
                type="radio"
                value={mode}
              />
              {mode}
            </label>
          ))}
        </div>

        <div
          className={`transition-all duration-500 my-2.5 ${
            isExpanded ? "w-55" : "w-12"
          }`}
        >
          <Link
            to={buildInternalHref(buildNavMode(NAV_ITEMS[0]))}
            onClick={() => handleNavItemClick(NAV_ITEMS[0])}
            className="flex h-9 items-center justify-center rounded-[30px] bg-[#764cfc] px-3 py-0 text-white no-underline transition text-sm/9 hover:bg-[#6535ff]"
          >
            <span className="inline-flex w-6 shrink-0 justify-center text-[14px]">
              {navIconFor("create")}
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              &nbsp;Create RFQ
            </span>
          </Link>
        </div>

        <nav className={`h-full overflow-y-auto overflow-x-hidden`}>
          {navItems.slice(1).map((item) => {
            const itemMode = buildNavMode(item);
            const active = isActiveMode(currentMode, item);

            return (
              <div
                key={item.key}
                className={`flex items-center overflow-hidden transition-all duration-500 ${isExpanded ? "w-55" : "w-12"}`}
              >
                <Link
                  to={buildInternalHref(itemMode)}
                  onClick={() => handleNavItemClick(item)}
                  className={`flex flex-1 items-center rounded-[30px] px-3.75 h-9 w-full py-0 text-left no-underline transition text-sm/9 ${
                    active
                      ? "bg-[#505050] text-white"
                      : "text-white/50 hover:bg-[#68686838] hover:text-white"
                  }`}
                >
                  <span className={`inline-flex w-6 shrink-0 justify-center pl-0.5 text-[14px] ${!isExpanded && "-translate-x-1"}`}>
                    {navIconFor(item.key)}
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isExpanded
                        ? "max-w-40 opacity-100"
                        : "max-w-0 opacity-0"
                    }`}
                  >
                    &nbsp;{item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <div
        className={`flex h-15 justify-center ${
          isExpanded ? "flex-row items-end gap-2" : "flex-col items-center"
        }`}
      >
        <div
          className="relative"
          ref={languageMenuRef}
          onMouseEnter={() => {
            setLanguageMenuOpen(true);
            setLinksMenuOpen(false);
            setLinksMenuFocused(false);
          }}
          onMouseLeave={() => {
            if (!languageMenuFocused) {
              setLanguageMenuOpen(false);
            }
          }}
        >
          <button
            className="flex h-7.5 w-5 items-center justify-center border-none bg-transparent p-0 text-white transition hover:opacity-85"
            onClick={() => {
              setLanguageMenuOpen(true);
              setLanguageMenuFocused(true);
              setLinksMenuOpen(false);

              if (languageMenuFocused) {
                setLanguageMenuOpen(false);
                setLanguageMenuFocused(false);
              }
            }}
            type="button"
          >
            <BsTranslate className="size-4" />
          </button>
          {languageMenuOpen ? (
            <div className="absolute bottom-7.5 right-0 min-w-25 rounded-lg border border-[#c1acce] bg-white p-2 text-sm text-slate-900 shadow-sm">
              <button
                className={`mb-0.5 block w-full rounded-[20px] px-[0.8rem] py-1 text-left text-[14px] hover:bg-[#6800cb26] ${
                  lang === "ko" ? "bg-[#6800cb26] font-medium text-black" : ""
                }`}
                onClick={() => {
                  setLang("ko");
                  setLanguageMenuOpen(false);
                }}
                type="button"
              >
                한국어
              </button>
              <button
                className={`block w-full rounded-[20px] px-[0.8rem] py-1 text-left text-[14px] hover:bg-[#6800cb26] ${
                  lang === "en" ? "bg-[#6800cb26] font-medium text-black" : ""
                }`}
                onClick={() => {
                  setLang("en");
                  setLanguageMenuOpen(false);
                }}
                type="button"
              >
                English
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="relative"
          ref={linksMenuRef}
          onMouseEnter={() => {
            setLinksMenuOpen(true);
            setLanguageMenuOpen(false);
            setLanguageMenuFocused(false);
          }}
          onMouseLeave={() => {
            if (!linksMenuFocused) {
              setLinksMenuOpen(false);
            }
          }}
        >
          <button
            className="flex h-7.5 w-5 items-center justify-center border-none bg-transparent p-0 text-white transition hover:opacity-75"
            onClick={() => {
              setLinksMenuOpen(true);
              setLinksMenuFocused(true);
              setLanguageMenuOpen(false);

              if (linksMenuFocused) {
                setLinksMenuOpen(false);
                setLinksMenuFocused(false);
              }
            }}
            type="button"
          >
            <BsBoxArrowUpRight className="size-3.75" />
          </button>
          {linksMenuOpen ? (
            <div
              className={`absolute bottom-7.5 left-0 rounded-lg border border-[#c1acce] bg-white p-0 text-slate-900 shadow-sm ${
                isExpanded ? "w-125" : "w-[320px]"
              }`}
            >
              <div
                className={`${isExpanded ? "grid grid-cols-[200px_1fr]" : "grid grid-cols-1"}`}
              >
                <div className="rounded-l bg-[#f5f3f8] p-2">
                  <h4 className="mb-1.25 px-[0.7rem] py-2 text-[1.1rem] font-medium text-slate-700">
                    RFQ Related
                  </h4>
                  <div className="space-y-1">
                    {RFQ_SHEET_LINKS.map((item) => (
                      <a
                        key={item.href}
                        className="mb-0.5 flex items-center justify-start rounded-[20px] px-[0.8rem] py-1 text-[14px] text-slate-700 no-underline transition hover:bg-[#6800cb26]"
                        href={item.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <div className="mr-2.5 flex shrink-0 items-center justify-center rounded-full border border-[#c1acce] shadow-sm size-7.5">
                          <img
                            alt=""
                            className="size-3.75"
                            src={faviconFor(item.href)}
                          />
                        </div>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <h4 className="mb-1.25 px-[0.7rem] py-2 text-[1.1rem] font-medium text-slate-700">
                    Useful Links
                  </h4>
                  <div className="max-h-56.25 space-y-1 overflow-y-auto">
                    {externalLinks.map(([label, href]) => (
                      <a
                        key={`${label}-${href}`}
                        className="mb-0.5 flex items-center justify-start rounded-[20px] px-[0.8rem] py-1 text-[14px] text-slate-700 no-underline transition hover:bg-[#6800cb26]"
                        href={href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <div className="mr-2.5 flex shrink-0 items-center justify-center rounded-full border border-[#c1acce] shadow-sm size-7.5">
                          <img
                            alt=""
                            className="size-3.75"
                            src={faviconFor(href)}
                          />
                        </div>
                        <span>{label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
