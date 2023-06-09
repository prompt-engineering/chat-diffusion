"use client";

import NewChat from "@/assets/icons/new-chat.svg";
import TrashcanIcon from "@/assets/icons/trashcan.svg";
import LogoutIcon from "@/assets/icons/logout.svg";
import Image from "next/image";
import content from "@/assets/images/content.png";
import send from "@/assets/icons/send.svg?url";
import image_polaroid from "@/assets/icons/image-polaroid.svg?url";
import React, {
  ChangeEventHandler,
  createRef,
  Dispatch,
  DragEventHandler,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import styled from "@emotion/styled";
import type {
  DeepDanbooruTag,
  ResponseGetConversations,
} from "@/utils/type.util";
import { ResponseGetChats, ResponseSend } from "@/utils/type.util";
import { BeatLoader } from "react-spinners";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@chakra-ui/react";
import * as ChatAPI from "@/api/chat";
import * as ConversationAPI from "@/api/conversation";
import * as UserAPI from "@/api/user";
import SimpleMarkdown from "@/components/markdown/SimpleMarkdown";
import { isClientSideOpenAI } from "@/api/edge/user";
import * as EdgeChatAPI from "@/api/edge/chat";
import { getTags } from "@/utils/huggingface.space.util";
import { DeepDanbooru } from "../DeepDanbooru";

const ChatInput = styled("input")`
  background: #ffffff;
  border-radius: 8px;
  border: none;
  padding: 0.5rem 1rem;
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  color: #1e1e1e;
  outline: none;
  transition: all 0.2s ease-in-out;

  &:focus {
    box-shadow: 0 0 0 2px #1e1e1e;
  }

  &:focus::placeholder {
    color: #1e1e1e;
  }
`;
const ChatInputWrapper = styled("div")`
  position: absolute;
  bottom: 8px;
  height: 48px;
  background-color: #fff;
  border-radius: 8px;
  max-width: 90%;
`;
const ChatsWrapper = styled("div")`
  // good looking scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
const ButtonWrapper = styled("div")`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 8px;
`;
const ChatSendButton = styled("button")`
  width: 48px;
  height: 48px;
  background-image: url(${send});
  background-size: 24px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  border: none;
  outline: none;
`;

const UploadFileButton = styled("button")`
  width: 48px;
  height: 48px;
  background-image: url(${image_polaroid});
  background-size: 24px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  border: none;
  outline: none;
`;

export const ChatRoom = ({
  dict,
  setIsLoggedIn,
  initMessage,
}: {
  dict: Record<string, string>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  initMessage?: string;
}) => {
  const chatsWrapper = React.useRef<HTMLDivElement>(null);
  const [disable, setDisable] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ResponseGetChats>([]);
  const [message, setMessage] = React.useState(initMessage ?? "");

  const [conversations, setConversations] = useState<ResponseGetConversations>(
    []
  );
  const [currentConversation, setCurrentConversation] = useState<number | null>(
    null
  );
  // editing conversation name
  const [editing, setEditing] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [file, setFile] = useState(new Blob());
  const fileInputRef = createRef<HTMLInputElement>();
  const [clearTagSelected, setClearTagSelected] = useState(0);

  // get conversations
  useEffect(() => {
    (async () => {
      try {
        const data = (await ConversationAPI.getConversations()) ?? [];
        setConversations(data);
      } catch (error) {
        setConversations([]);
        alert("Error: " + JSON.stringify(error));
      }
    })();
  }, []);

  // scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      if (chatsWrapper.current) {
        chatsWrapper.current.scrollTop = chatsWrapper.current.scrollHeight;
      }
    });
  }, [chatHistory]);

  const onEnterForSendMessage: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    setClearTagSelected(clearTagSelected + 1);
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      event.preventDefault();

      sendMessage();
    }
  };

  async function createConversation() {
    const data = await ConversationAPI.createConversation();
    if (!data) {
      return;
    }

    setConversations([data, ...conversations]);
    if (data.id) setCurrentConversation(data.id);
    return data;
  }

  async function changeConversationName(conversationId: number, name: string) {
    await ConversationAPI.changeConversationName(conversationId, name);

    setConversations((c) =>
      c.map((conversation) => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            name,
          };
        }
        return conversation;
      })
    );
  }

  const handleConversation = useDebouncedCallback(
    async (
      conversationId: number | null,
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      if (event.detail > 1) {
        // double click
        if (conversationId == null) {
          return;
        }
        setEditingName(
          conversations.find((c) => c.id === conversationId)?.name ?? ""
        );
        setEditing(conversationId);
        return;
      }

      if (conversationId == null) {
        setCurrentConversation(null);
        setChatHistory([]);
        return;
      }
      setDisable(true);

      try {
        setCurrentConversation(conversationId);
        const data = await ChatAPI.getChatsByConversationId(
          conversationId,
          true
        );
        if (!data) {
          return;
        }
        setChatHistory(data);
      } catch (e) {
        console.log("changeConversation: ", e);
      } finally {
        setDisable(false);
      }
    },
    200
  );

  async function deleteConversation(conversationId: number) {
    if (conversationId == currentConversation) {
      setCurrentConversation(null);
      setChatHistory([]);
    }
    const data = await ConversationAPI.deleteConversation(conversationId);
    if (!data) {
      return;
    }
    setConversations(
      conversations.filter((conversation) => conversation.id !== conversationId)
    );
  }

  async function deleteAllConversations() {
    const data = await ConversationAPI.deleteAllConversations();
    if (!data) {
      return;
    }
    setConversations([]);
    setCurrentConversation(null);
    setChatHistory([]);
  }
  // FIXME anti-pattern, should use `useState`
  let codeMark = "";
  async function sendMessage(prompt?: string) {
    const _message = message.length ? message : prompt;
    console.log(_message);
    if (!_message || _message.length === 0) {
      alert("Please enter your message first.");
      return;
    }

    try {
      setDisable(true);
      let _currentConversation = currentConversation;
      if (currentConversation == null) {
        const created = await createConversation();
        _currentConversation = created?.id ?? null;
        setCurrentConversation(_currentConversation);
        if (!_currentConversation) return;
      }

      setMessage("");
      let updatedHistory = [
        ...chatHistory,
        {
          role: "user",
          content: _message,
          // TODO(CGQAQ): custom name of user
          // name: "User",
        },
      ] as ResponseSend;

      setChatHistory([...updatedHistory]);

      if (isClientSideOpenAI()) {
        const _messages = await EdgeChatAPI.sendMessage(
          _currentConversation as number,
          _message
        );
        setDisable(false);
        if (_messages && _messages.length) {
          setChatHistory([...updatedHistory, ..._messages]);
        } else {
          setDisable(false);
          setChatHistory([
            ...updatedHistory.slice(0, updatedHistory.length - 1),
          ]);
        }
        return;
      }

      const data = await ChatAPI.sendMsgWithStreamRes(
        _currentConversation as number,
        _message
      );
      if (!data) {
        setDisable(false);
        setChatHistory([...updatedHistory.slice(0, updatedHistory.length - 1)]);
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        isDone = done;
        const chunkValue = decoder.decode(value);
        const lines = chunkValue
          .split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            setDisable(false);
          } else {
            const parsed = JSON.parse(message).choices[0].delta;
            if (parsed && Object.keys(parsed).length > 0) {
              if (!!parsed.role) {
                parsed.content = "";
                updatedHistory = [...updatedHistory, parsed];
              } else if (!!parsed.content) {
                if (parsed.content === "```") {
                  // code block start
                  if (!codeMark) {
                    codeMark = parsed.content;
                  } else {
                    // code block end remove it
                    codeMark = "";
                  }
                }
                updatedHistory[updatedHistory.length - 1].content +=
                  parsed.content;
              }
              setChatHistory([...updatedHistory]);
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      setDisable(false);
    } finally {
      // setDisable(false);
    }
  }

  async function logout() {
    await UserAPI.logout();
    setIsLoggedIn(false);
  }

  const handleImageFileUpload: ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (!e.target.files?.length) return;
    if (!currentConversation) {
      handleImageUploadReset();
      return;
    }
    setDisable(true);
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    const fileContent = await new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(uploadedFile);
    });
    const chats = chatHistory;
    let id = 1;
    chats.forEach((c) => {
      if (c.id && c.id >= id) id = c.id + 1;
    });
    let chat = {
      id,
      conversation_id: currentConversation,
      role: "upload",
      content: fileContent as string,
      name: undefined,
      created_at: new Date().toISOString(),
    };
    chats.push(chat);
    setChatHistory(chats);
    ChatAPI.saveChat(currentConversation, chat);
    const tags = await getTags(fileContent as string);
    chat = {
      id: id + 1,
      conversation_id: currentConversation,
      role: "info",
      content: JSON.stringify(tags),
      name: undefined,
      created_at: new Date().toISOString(),
    };
    chats.push(chat);
    setChatHistory(chats);
    await ChatAPI.saveChat(currentConversation, chat);
    handleImageUploadReset();
    setDisable(false);
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleImageUploadClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUploadReset = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(new Blob());
  };

  const handleTagSelectedChange = (tags: string[]) => {
    setMessage(`${dict["tag_prompt"]}${tags.join(",")}`);
  };

  return (
    <div className="flex w-full h-full max-w-[100%]">
      {/* left */}
      <div className="hidden max-w-[300px] bg-gray-900 text-white p-2 md:grid grid-rows-[45px_1fr_100px] select-none">
        <div
          className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
          onClick={createConversation}
        >
          <NewChat color="white" />
          New chat
        </div>
        <div className="overflow-y-auto overflow-container">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`${
                currentConversation === conversation.id
                  ? "bg-emerald-700 hover:bg-emerald-900"
                  : "hover:bg-gray-500/10"
              } flex py-3 px-3 items-center justify-between gap-3 rounded-md transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20`}
              onClick={(event) => {
                handleConversation(conversation.id!, event);
              }}
            >
              {editing === conversation.id ? (
                <Input
                  autoFocus={true}
                  value={editingName}
                  onChange={(ev) => {
                    setEditingName(ev.currentTarget.value);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === "NumpadEnter") {
                      ev.preventDefault();
                      changeConversationName(
                        conversation.id!,
                        ev.currentTarget.value
                      ).finally(() => {
                        setEditing(null);
                      });
                    } else if (ev.key === "Escape") {
                      ev.preventDefault();
                      setEditing(null);
                    }
                  }}
                  onBlur={async (ev) => {
                    await changeConversationName(
                      conversation.id!,
                      ev.currentTarget.value
                    );
                    setEditing(null);
                  }}
                />
              ) : (
                <>
                  <div className="text-sm font-medium overflow-ellipsis truncate max-w-[215px]">
                    {conversation.name}
                  </div>
                  {/* delete button */}
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure to delete this conversation?")
                      ) {
                        deleteConversation(conversation.id!);
                      }
                    }}
                  >
                    <TrashcanIcon color="white" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div>
          <div
            className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure to delete ALL conversations?")) {
                deleteAllConversations();
              }
            }}
          >
            <TrashcanIcon color="white" />
            Clear conversations
          </div>
          <div
            className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/20"
            onClick={logout}
          >
            <LogoutIcon color="white" />
            Log out
          </div>
        </div>
      </div>

      {/* right */}
      <div className="relative flex flex-col items-center justify-start gap-16 h-full py-4 flex-1 max-w-[100%]">
        {/* {chatHistory.length === 0 && (
          <Image className="mt-8" src={content} alt="background image"></Image>
        )} */}

        {/* chats */}
        <ChatsWrapper
          ref={chatsWrapper}
          className="flex flex-col gap-4 w-full px-4 max-h-[80%] overflow-y-auto mt-11 scroll-smooth"
        >
          {chatHistory.map((chat, index) => {
            return (
              <div key={index} className="flex flex-col gap-14 w-full">
                {chat && chat.role == "user" && (
                  <div className="self-end flex">
                    {/* chat bubble badge */}
                    <div className="rounded-md bg-green-400 text-white text-xl px-4 py-2 max-w-xl">
                      <SimpleMarkdown content={chat.content}></SimpleMarkdown>
                    </div>
                  </div>
                )}
                {chat && chat.role == "assistant" && (
                  <div className="self-start flex">
                    <div className="rounded-md bg-orange-400 text-white text-xl px-4 py-2 max-w-xl">
                      <SimpleMarkdown
                        content={`${chat.content}${codeMark}`}
                      ></SimpleMarkdown>
                    </div>
                  </div>
                )}
                {chat &&
                  chat.role == "image" &&
                  chat.content.indexOf("data:image") != -1 && (
                    <div className="self-start flex">
                      <div className="rounded-md bg-orange-400 text-white text-xl px-4 py-2 max-w-xl">
                        <img className="" src={chat.content} alt="image" />
                      </div>
                    </div>
                  )}
                {chat &&
                chat.role == "upload" &&
                chat.content.indexOf("data:image") != -1 ? (
                  <div className="self-end flex">
                    <div className="rounded-md bg-green-400 text-white text-xl px-4 py-2 max-w-xl">
                      <img className="" src={chat.content} alt="image" />
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {chat &&
                chat.role == "info" &&
                chat.content.indexOf("confidence") != -1 ? (
                  <div className="self-start flex">
                    <div className="rounded-md bg-emerald-700 text-white text-xl px-4 py-2 max-w-xl">
                      <DeepDanbooru
                        dict={dict}
                        tags={JSON.parse(chat.content)}
                        handleTagSelectedChange={handleTagSelectedChange}
                        clearSelectedFlag={clearTagSelected}
                      />
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            );
          })}
        </ChatsWrapper>

        <ChatInputWrapper className="w-full md:w-9/12 mb-5">
          <ChatInput
            disabled={disable}
            placeholder="Type your message here..."
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            onKeyDown={onEnterForSendMessage}
            className="pr-10 md:w-9/12 border-0 md:pr-0 focus:ring-0"
          />
          {disable ? (
            <BeatLoader
              className={"absolute top-1/2 -translate-y-[50%] right-[8px]"}
              size={8}
              color="black"
            />
          ) : (
            <ButtonWrapper className="flex">
              <UploadFileButton
                className="w-10 h-full"
                disabled={disable}
                onClick={handleImageUploadClick}
              />
              <ChatSendButton
                className="w-10 h-full"
                disabled={disable}
                onClick={() => sendMessage()}
              />
              <input
                disabled={disable}
                ref={fileInputRef}
                type="file"
                onChange={handleImageFileUpload}
                style={{ display: "none" }}
                accept="image/*"
              />
            </ButtonWrapper>
          )}
        </ChatInputWrapper>
      </div>
    </div>
  );
};
