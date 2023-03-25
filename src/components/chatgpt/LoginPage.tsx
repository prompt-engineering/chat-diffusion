"use client";

import { Button, Input } from "@/components/ChakraUI";
import React, { Dispatch, SetStateAction } from "react";
import * as UserApi from "@/api/user";

export const LoginPage = ({
  dict,
  setIsLoggedIn,
}: {
  dict: Record<string, string>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}) => {
  const [openAiKey, setOpenAiKey] = React.useState("");
  const [huggingfaceToken, setHuggingFaceToken] = React.useState("");

  async function login(key: string, token: string) {
    if (key.length === 0) {
      alert(dict["enter_openai_api_key"]);
      return;
    }

    if (token.length === 0) {
      alert(dict["enter_huggingface_access_token"]);
      return;
    }

    const data = await UserApi.login(key, token);
    if (data) {
      setIsLoggedIn(true);
    } else {
      alert("Login failed. Please check your API key.");
      setIsLoggedIn(false);
    }
  }

  return (
    <div className="flex flex-col justify-center h-[85vh] md:w-1/2 p-4">
      <h1 className="text-white text-[34px] font-bold">ChatDiffusion</h1>
      <p
        className="text-white"
        style={{
          whiteSpace: "pre-line",
          marginBottom: "1.25rem",
        }}
      >
        {dict["select_api_type_note"]}
      </p>
      <p className="text-white text-xl">{dict["openai_api_key"]}</p>
      <div className="text-white mt-5">
        <div>
          1. {dict["sign_up"]} &nbsp;
          <a
            href="https://platform.openai.com/signup"
            target="_blank"
            className="underline"
          >
            OpenAI Platform.
          </a>
        </div>
        <div>
          2. {dict["create_new"]} secret key: &nbsp;
          <a
            href="https://platform.openai.com/account/api-keys"
            target="_blank"
            className="underline"
          >
            Settings → API keys.
          </a>
        </div>
        <div>3. {dict["copy_paste"]} API key:</div>
      </div>
      <div className="my-4 flex gap-2 items-center flex-col md:flex-row">
        <Input
          className="text-white"
          value={openAiKey}
          onChange={(ev) => setOpenAiKey(ev.target.value)}
        ></Input>
      </div>
      <p
        className="text-white text-xl"
        style={{
          marginTop: "1.25rem",
        }}
      >
        {dict["huggingface_access_token"]}
      </p>
      <div className="text-white mt-5">
        <div>
          1. {dict["sign_up"]} &nbsp;
          <a
            href="https://huggingface.co/join"
            target="_blank"
            className="underline"
          >
            Hugging Face.
          </a>
        </div>
        <div>
          2. {dict["create_new"]} Access Token: &nbsp;
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            className="underline"
          >
            Settings → Access Tokens.
          </a>
        </div>
        <div>3. {dict["copy_paste"]} Access Token:</div>
      </div>
      <div className="my-4 flex gap-2 items-center flex-col md:flex-row">
        <Input
          className="text-white"
          value={huggingfaceToken}
          onChange={(ev) => setHuggingFaceToken(ev.target.value)}
        ></Input>
      </div>
      <div>
        <Button
          className="bg-white w-full md:w-auto"
          onClick={async () => {
            await login(openAiKey, huggingfaceToken);
          }}
        >
          {dict["go"]}
        </Button>
      </div>
    </div>
  );
};
