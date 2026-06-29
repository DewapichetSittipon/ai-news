import { useEffect, useState } from "react";
import type { NewsArticle, SnapshotIndex } from "../types";

// Resolve data URLs against Vite's base so they work on a Pages subpath.
const base = import.meta.env.BASE_URL;

type Async<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: T };

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Load the list Snapshot (index.json). */
export function useSnapshotIndex(): Async<SnapshotIndex> {
  const [state, setState] = useState<Async<SnapshotIndex>>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    getJson<SnapshotIndex>("data/index.json")
      .then((data) => alive && setState({ status: "ready", data }))
      .catch((e: unknown) =>
        alive && setState({ status: "error", error: String(e) }),
      );
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/** Load a single article by id (lazily, only when opened). */
export function useArticle(id: string | undefined): Async<NewsArticle> {
  const [state, setState] = useState<Async<NewsArticle>>({ status: "loading" });

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setState({ status: "loading" });
    getJson<NewsArticle>(`data/articles/${id}.json`)
      .then((data) => alive && setState({ status: "ready", data }))
      .catch((e: unknown) =>
        alive && setState({ status: "error", error: String(e) }),
      );
    return () => {
      alive = false;
    };
  }, [id]);

  return state;
}
