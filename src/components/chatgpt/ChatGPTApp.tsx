"use client";

import { isClientSideOpenAI, getApiKey, getToken } from "@/api/edge/user";
import { ChatRoom } from "@/components/chatgpt/ChatRoom";
import { LoginPage } from "@/components/chatgpt/LoginPage";
import React, { useEffect, useState } from "react";

type ChatGPTAppProps = {
  dict: Record<string, string>;
  loggedIn?: boolean;
  updateLoginStatus?: (loggedIn: boolean) => void;
  initMessage?: string;
};
export const ChatGPTApp = ({
  dict,
  loggedIn,
  initMessage,
  updateLoginStatus,
}: ChatGPTAppProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn ?? false);

  useEffect(() => {
    if (isClientSideOpenAI()) {
      let _isLoggedin = getApiKey() && getToken() ? true : false;
      if (isLoggedIn != _isLoggedin) {
        setIsLoggedIn(_isLoggedin);
        if (updateLoginStatus) {
          updateLoginStatus(_isLoggedin);
        }
        return;
      }
    }
    if (updateLoginStatus) {
      updateLoginStatus(isLoggedIn);
    }
  }, [isLoggedIn]);

  return isLoggedIn ? (
    <ChatRoom
      setIsLoggedIn={setIsLoggedIn}
      initMessage={initMessage}
      dict={dict}
    />
  ) : (
    <LoginPage setIsLoggedIn={setIsLoggedIn} dict={dict} />
  );
};
