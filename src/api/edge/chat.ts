import {
  CHAT_COMPLETION_CONFIG,
  CHAT_COMPLETION_URL,
  HUGGINGFACE_DEFAULT_STABLE_DIFFUSION_MODEL,
} from "@/configs/constants";
import { ResponseGetChats, ResponseSend } from "@/utils/type.util";
import { WebStorage } from "@/storage/webstorage";
import { drawImage } from "@/utils/huggingface.txt2img.util";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse,
} from "openai";
import { getApiKey, getToken } from "./user";

export function getChatsByConversationId(
  conversationId: number,
  withExtra?: boolean
) {
  const _chatRepo = new WebStorage<ResponseGetChats>("o:c");
  const _chats = _chatRepo.get<ResponseGetChats>() ?? [];
  const _filtered = _chats.filter(
    (e) =>
      e.conversation_id == conversationId &&
      e.role != "system" &&
      (e.role == "user" || e.role == "assistant" || withExtra)
  );
  if (withExtra) return _filtered;
  return [
    {
      name: undefined,
      content: `Whever I ask to generate an image, respond with the following JSON: {"model":"${HUGGINGFACE_DEFAULT_STABLE_DIFFUSION_MODEL}","prompt":string,"negative_prompt":string}, and fill in prompt with very detailed tags used in Stable Diffusion, and fill in negative prompt with common negative tags used in Stable Diffusion, and don't use any language other than English.`,
      id: 0,
      role: "system",
      conversation_id: conversationId,
      created_at: undefined,
    },
    ..._filtered,
  ];
}

export function saveChat(
  conversationId: number,
  message: {
    role: string;
    content: string;
  }
) {
  const _chatRepo = new WebStorage<ResponseGetChats>("o:c");
  const _chats = _chatRepo.get<ResponseGetChats>() ?? [];
  let nextIndex = 1;
  for (const _index in _chats) {
    if ((_chats[_index].id ?? 0) >= nextIndex)
      nextIndex = (_chats[_index].id ?? 0) + 1;
  }
  const _chat = {
    id: nextIndex,
    conversation_id: conversationId,
    role: message.role,
    content: message.content,
    name: undefined,
    created_at: Date.now().toString(),
  };
  _chats.push(_chat);
  _chatRepo.set(_chats);
  return [_chat];
}

async function taskDispatcher(conversationId: number, _message: string) {
  try {
    const jsonRegex = /{.*}/s; // s flag for dot to match newline characters
    const _match = _message.match(jsonRegex);
    if (_match) {
      const json = JSON.parse(_match[0]);
      if (
        "model" in json &&
        "prompt" in json &&
        "negative_prompt" in json &&
        json.prompt.length
      ) {
        const _token = getToken();
        if (!_token) throw new Error("Access token not set.");
        let _response = await drawImage(
          _token,
          json.model,
          json.prompt,
          json.negative_prompt
        );
        if (_response.status == 503) {
          _response = await drawImage(
            _token,
            json.model,
            json.prompt,
            json.negative_prompt,
            true
          );
        }
        if (_response.status == 200) {
          const imgBlob = await _response.blob();
          const data: string = await new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imgBlob);
          });
          const message = {
            role: "image",
            content: data,
          };
          return saveChat(conversationId, message);
        } else {
          throw new Error((await _response.json()).error);
        }
      }
    }
  } catch (e) {
    console.log(_message);
    console.log("taskDispatcher", e);
  }
}

export async function sendMessage(
  conversationId: number,
  message: string,
  name?: string
) {
  const messages = getChatsByConversationId(conversationId).map((it) => ({
    role: it.role,
    content: it.content,
    name: it.name,
  })) as ChatCompletionRequestMessage[];
  const _message: ChatCompletionRequestMessage = {
    role: "user",
    content: message,
    name: name ?? undefined,
  };
  messages.push(_message);
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not set.");
  try {
    const response = await fetch(CHAT_COMPLETION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...CHAT_COMPLETION_CONFIG,
        messages: messages,
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json);
    }
    const { choices } = json as CreateChatCompletionResponse;
    if (choices.length === 0 || !choices[0].message) {
      throw new Error("No response from OpenAI");
    }
    saveChat(conversationId, _message);
    return [
      ...saveChat(conversationId, choices[0].message),
      ...((await taskDispatcher(conversationId, choices[0].message.content)) ??
        []),
    ] as ResponseSend;
  } catch (e) {
    console.error(e);
  }
}

export function deleteChatsByConversationId(conversationId: number) {
  const _chatRepo = new WebStorage<ResponseGetChats>("o:c");
  const _chats = _chatRepo.get<ResponseGetChats>() ?? [];
  const _filtered = _chats.filter((e) => e.conversation_id != conversationId);
  _chatRepo.set(_filtered);
}

export function deleteAllChats() {
  const _chatRepo = new WebStorage<ResponseGetChats>("o:c");
  _chatRepo.set([]);
}
