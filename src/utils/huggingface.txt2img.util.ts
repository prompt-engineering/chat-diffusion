import { HUGGINGFACE_INFERENCE_URL } from "@/configs/constants";

export async function drawImage(
  token: string,
  model: string,
  prompt: string,
  negative_prompt?: string,
  wait_for_model?: boolean
) {
  const payload = {
    inputs: prompt,
    parameters: {
      negative_prompt: negative_prompt ? [negative_prompt] : undefined,
      num_images_per_prompt: 1,
    },
    options: {},
  };
  if (wait_for_model)
    payload.options = {
      wait_for_model: true,
    };
  return fetch(`${HUGGINGFACE_INFERENCE_URL}/models/${model}`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });
}
