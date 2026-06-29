import type { Localized } from "../types";

// UI chrome strings. News content itself is translated at build time and
// lives in the Snapshot, not here.
export const UI = {
  appTitle: { en: "AI NEWS", th: "ข่าว AI" },
  subtitle: { en: "AI NEWSROOM // 8-BIT EDITION", th: "ห้องข่าว AI // ฉบับ 8 บิต" },
  pressStart: { en: "PRESS START", th: "กดเริ่ม" },
  start: { en: "START", th: "เริ่ม" },
  all: { en: "ALL", th: "ทั้งหมด" },
  searchPlaceholder: { en: "SEARCH NEWS...", th: "ค้นหาข่าว..." },
  bookmarks: { en: "BOOKMARKS", th: "ที่บันทึก" },
  news: { en: "NEWS", th: "ข่าว" },
  noResults: { en: "NO NEWS FOUND", th: "ไม่พบข่าว" },
  noBookmarks: { en: "NO BOOKMARKS YET", th: "ยังไม่มีที่บันทึก" },
  back: { en: "BACK", th: "ย้อนกลับ" },
  readOriginal: { en: "READ ORIGINAL ↗", th: "อ่านต้นฉบับ ↗" },
  latest: { en: "LATEST", th: "ล่าสุด" },
  oldest: { en: "OLDEST", th: "เก่าสุด" },
  loading: { en: "LOADING...", th: "กำลังโหลด..." },
  notFound: { en: "ARTICLE NOT FOUND", th: "ไม่พบบทความ" },
  sound: { en: "SOUND", th: "เสียง" },
  on: { en: "ON", th: "เปิด" },
  off: { en: "OFF", th: "ปิด" },
  newBadge: { en: "NEW", th: "ใหม่" },
  bookmark: { en: "BOOKMARK", th: "บันทึก" },
  bookmarked: { en: "SAVED ★", th: "บันทึกแล้ว ★" },
  updatedAt: { en: "DATA AS OF", th: "ข้อมูล ณ" },
} satisfies Record<string, Localized>;

export type UiKey = keyof typeof UI;
