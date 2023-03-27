import { HUGGINGFACE_DEEPDANBOORU_SPACE_URL } from "@/configs/constants";
import { DeepDanbooruTag } from "./type.util";

function randomhash(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getTags(image: string): Promise<DeepDanbooruTag[]> {
  const hash = randomhash(12);
  const send_hash = {
    fn_index: 0,
    session_hash: hash,
  };
  const img_data = {
    fn_index: 0,
    data: [image, 0.5],
    session_hash: hash,
  };
  const socket = new WebSocket(HUGGINGFACE_DEEPDANBOORU_SPACE_URL);
  return new Promise((resolve, reject) => {
    socket.onerror = (event: Event) => {
      reject(new Error(`WebSocket error: ${event}`));
    };
    socket.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data["msg"] === "send_hash") {
        socket.send(JSON.stringify(send_hash));
      } else if (data["msg"] === "send_data") {
        socket.send(JSON.stringify(img_data));
      } else if (data["msg"] === "process_completed") {
        const tags = data["output"]["data"][0]["confidences"];
        resolve(tags);
      }
    };
  });
}
