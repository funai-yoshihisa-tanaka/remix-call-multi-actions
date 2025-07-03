import { useFetcher, useLoaderData, Form } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";

import { action as searchAction } from "../_api/search/route";
import { action as submitAction } from "../_api/submit/route";
import List from "./list"
import Select from "./select";

// loader関数で最大ページ数を定義
export async function loader({ request }: LoaderFunctionArgs) {
  const MAX_PAGE = 10; // 最大ページ数
  return { MAX_PAGE };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Remix LocalStorage Paging" },
    { name: "description", content: "Managing page state with localStorage in Remix." },
  ];
};

export default function Index() {
  const { MAX_PAGE } = useLoaderData<typeof loader>();
  // useStateの元のセッター関数を_setPageNumberとして使用
  const [pageNumber, _setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchFetcher = useFetcher<typeof searchAction>();

  const search = (pageNumber: number) => {
    const formData = new FormData();
    formData.set("page-num", `${pageNumber}`);
    searchFetcher.submit(formData, { method: "post", action: "./search" })
  }
  const submitFetcher = useFetcher<typeof submitAction>();

  /**
   * ページ番号を更新し、localStorageへの保存と範囲バリデーションを行う関数
   * @param newPage 更新する新しいページ番号
   */
  const setPageNumber = (newPage: number) => {
    let validatedPage = newPage;

    // ページ範囲のバリデーション
    if (newPage < 1) {
      validatedPage = 1;
    } else if (newPage > MAX_PAGE) {
      validatedPage = MAX_PAGE;
    }

    // クライアントサイドでのみlocalStorageを更新
    if (typeof window !== "undefined") {
      localStorage.setItem("currentPage", validatedPage.toString());
    }

    // 実際のState更新は_setPageNumberで行う
    _setPageNumber(validatedPage);
    search(validatedPage);
  };

  // コンポーネントマウント時にlocalStorageからページ数を読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPage = localStorage.getItem("currentPage");
      if (storedPage) {
        const parsedPage = parseInt(storedPage, 10);
        // 読み込んだ値を新しいsetPageNumber関数で処理し、バリデーションと保存も行う
        setPageNumber(parsedPage);
      } else {
        // 初回アクセス時はデフォルト値1を設定
        setPageNumber(1);
      }
    }
    setIsLoading(false); // 読み込み完了
  }, [MAX_PAGE]); // MAX_PAGEが変更される可能性を考慮し依存配列に含める

  // 「前へ」ボタンクリック時の処理
  const goToPreviousPage = () => {
    // 現在のページ番号から1を減算して更新関数に渡す
    setPageNumber(pageNumber - 1);
  };

  // 「次へ」ボタンクリック時の処理
  const goToNextPage = () => {
    // 現在のページ番号に1を加算して更新関数に渡す
    setPageNumber(pageNumber + 1);
  };

  if (isLoading) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", textAlign: "center" }}>
        <h1>ページ数を読み込み中...</h1>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", textAlign: "center" }}>
      <div>
        {/* ページ数が1より大きい場合のみ「前へ」ボタンを表示 */}
        {pageNumber > 1 ? (
          <>
            <button onClick={goToPreviousPage} style={{ marginRight: "10px" }}>
              前へ
            </button>
          </>
        ) : (
          <button disabled style={{ marginRight: "10px" }}>
            前へ
          </button>
        )}
        {pageNumber.toString().padStart(2, "0")} / {MAX_PAGE.toString().padStart(2, "0")}
        {/* ページ数が最大値より小さい場合のみ「次へ」ボタンを表示 */}
        {pageNumber < MAX_PAGE ? (
          <button onClick={goToNextPage} style={{ marginLeft: "10px" }}>
            次へ
          </button>
        ) : (
          <button disabled style={{ marginLeft: "10px" }}>
            次へ
          </button>
        )}
      </div>
      <h3>選択可能な選択肢</h3>
      <List list={searchFetcher.data || []} />
      <submitFetcher.Form method="post" action="./submit" key={pageNumber}>
        <Select list={searchFetcher.data || []} />
        <button type="submit">送信</button>
      </submitFetcher.Form>
      { submitFetcher.data ? submitFetcher.data.num ? <p>You sent: {submitFetcher.data.num}</p> : <p>You sent empty option!</p> : <p>You did not select.</p> }
    </div>
  );
}