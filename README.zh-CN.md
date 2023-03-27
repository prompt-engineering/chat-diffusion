# ChatDiffusion - 集成了在线 AI 绘画功能的 ChatGPT UI

[![ci](https://github.com/prompt-engineering/chat-diffusion/actions/workflows/ci.yml/badge.svg)](https://github.com/prompt-engineering/chat-diffusion/actions/workflows/ci.yml)
![GitHub](https://img.shields.io/github/license/prompt-engineering/chat-diffusion)

[English](./README.md) | 简体中文

![截图](https://raw.githubusercontent.com/tianweiliu/.github/main/chatdiffusion.png)

演示：https://chat.fluoritestudio.com

## 目前仅支持客户端（浏览器）访问 OpenAI，服务器端调用正在开发中

## 集成的在线服务:
- [x] Hugging Face (Inference API)[https://huggingface.co/inference-api] 用于文字生成图像
  - [x] (prompthero/openjourney)[https://huggingface.co/prompthero/openjourney] 作为默认的 Stable Diffusion 模型, 你可以让 ChatGPT 把 "model" 换成 Hugging Face 上任意开启了 Inference API 的模型。
- [ ] Hugging Face Space 集成，用于图像转文字
  - [ ] (DeepDanbooru)[https://huggingface.co/spaces/hysts/DeepDanbooru] (开发中)

## 本地搭建

1. 从 GitHub 克隆 [ChatVisualNovel](https://github.com/prompt-engineering/chat-diffusion)。
2. 执行 `npm install`。
3. 直接运行 `npm run dev` 就可以使用了。

## LICENSE

This code is distributed under the MIT license. See [LICENSE](./LICENSE) in this directory.
