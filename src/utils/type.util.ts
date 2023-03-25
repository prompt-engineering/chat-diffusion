import { ChatCompletionRequestMessage } from "openai";

export type RequestSend = {
  action: "send";
  conversation_id: number;
  messages: ChatCompletionRequestMessage[];
};
export type ResponseSend = {
  id: number | undefined;
  conversation_id: number;
  role: string;
  content: string;
  name: string | undefined;
  created_at: string | undefined;
}[];

export type RequestGetChats = {
  action: "get_chats";
  conversation_id: number;
};

export type ResponseGetChats = {
  id: number | undefined;
  conversation_id: number;
  role: string;
  content: string;
  name: string | undefined;
  created_at: string | undefined;
}[];

export type RequestCreateConversation = {
  action: "create_conversation";
  name: string;
};

export type ResponseCreateConversation =
  | {
      id: number | undefined;
      name: string;
      created_at: string | undefined;
      user_id: number;
      deleted: number | undefined;
    }
  | null
  | undefined;

export type RequestGetConversations = {
  action: "get_conversations";
};

export type ResponseGetConversations = {
  id: number | undefined;
  name: string;
  created_at: string | undefined;
  user_id: number;
}[];

export type RequestChangeConversationName = {
  action: "change_conversation_name";
  conversation_id: number;
  name: string;
};

export type RequestDeleteConversation = {
  action: "delete_conversation";
  conversation_id: number;
};

export type RequestDeleteAllConversation = {
  action: "delete_all_conversations";
};
export type ResponseDeleteAllConversation = {
  message?: string;
  error?: string;
};
