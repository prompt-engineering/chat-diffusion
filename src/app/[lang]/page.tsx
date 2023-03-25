import React from "react";
import { getAppData } from "@/i18n";
import { cookies } from "next/headers";
import { SITE_USER_COOKIE } from "@/configs/constants";
import * as UserAPI from "@/api/user";
import { ChatGPTApp } from "@/components/chatgpt/ChatGPTApp";

async function Page() {
  const { locale, pathname, i18n } = await getAppData();
  const i18nProps: GeneralI18nProps = {
    locale,
    pathname,
    i18n: {
      dict: i18n.dict,
    },
  };

  const hashedKey = cookies().get(SITE_USER_COOKIE)?.value as string;

  let isLogin: boolean;
  try {
    isLogin = await UserAPI.isLoggedIn(hashedKey);
  } catch (e) {
    console.error(e);
    isLogin = false;
  }

  return (
    <div className="bg-[#343541] flex h-[85vh] overflow-y-auto rounded-md items-center justify-center">
      <ChatGPTApp dict={i18nProps.i18n.dict} loggedIn={isLogin} />
    </div>
  );
}

export default Page;
