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

  // 更新したページ番号をlocalStorageにも保存したいので、関数名を工夫
  const [pageNumber, _setPageNumber] = useState<number>(1);
  const setPageNumber = (newPage: number) => {
    let validatedPage = newPage;

    if (newPage < 1) {
      validatedPage = 1;
    } else if (newPage > MAX_PAGE) {
      validatedPage = MAX_PAGE;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("currentPage", validatedPage.toString());
    }

    _setPageNumber(validatedPage);
    search(validatedPage);
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchFetcher = useFetcher<typeof searchAction>();

  const search = (pageNumber: number) => {
    const formData = new FormData();
    formData.set("page-num", `${pageNumber}`);

    // 作ったエンドポイントのパスを指定
    searchFetcher.submit(formData, { method: "post", action: "./search" })
  }
  const submitFetcher = useFetcher<typeof submitAction>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPage = localStorage.getItem("currentPage");
      if (storedPage) {
        const parsedPage = parseInt(storedPage, 10);
        setPageNumber(parsedPage);
      } else {
        setPageNumber(1);
      }
    }
    setIsLoading(false);
  }, [MAX_PAGE]);

  // 「前へ」ボタンクリック時の処理
  const goToPreviousPage = () => {
    setPageNumber(pageNumber - 1);
  };

  const goToNextPage = () => {
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
      
      {/* 作ったエンドポイントのパスを指定 */}
      <submitFetcher.Form method="post" action="./submit" key={pageNumber}>
        <Select list={searchFetcher.data || []} />
        <button type="submit">送信</button>
      </submitFetcher.Form>
      { submitFetcher.data ? submitFetcher.data.num ? <p>You sent: {submitFetcher.data.num}</p> : <p>You sent empty option!</p> : <p>You did not select.</p> }
    </div>
  );
}