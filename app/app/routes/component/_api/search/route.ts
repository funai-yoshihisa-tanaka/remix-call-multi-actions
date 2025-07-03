import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const pageNum = formData.get("page-num")! as unknown as number;
  const returnList:number[] = []
  for (let i = (pageNum - 1) * 8 + 1; i <= pageNum * 8; i++) {
    returnList.push(i);
  }
  return returnList;
}