import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs): Promise<{num: number|null}> {
  const formData = await request.formData()
  const num = formData.get("selected-num") as number|""

  console.log("submitted", num == "" ? "empty" : num);
  
  return { num: num == "" ? null : num };
}