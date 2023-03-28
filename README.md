# ChatDiffusion - A ChatGPT web UI that integrates with variety of online Stable Diffusion services

[![ci](https://github.com/prompt-engineering/chat-diffusion/actions/workflows/ci.yml/badge.svg)](https://github.com/prompt-engineering/chat-diffusion/actions/workflows/ci.yml)
![GitHub](https://img.shields.io/github/license/prompt-engineering/chat-diffusion)
[![Discord](https://img.shields.io/discord/1082563233593966612)](https://discord.gg/FSWXq4DmEj)

English | [简体中文](./README.zh-CN.md)

![Screenshot](https://raw.githubusercontent.com/tianweiliu/.github/main/chatdiffusion.png)

Online Demo: [https://chat.fluoritestudio.com](https://chat.fluoritestudio.com)

Join us:

[![Chat Server](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/FSWXq4DmEj)

## Only support client-side (browser) call to OpenAI at this moment. Server-side WIP.

## Supported online services:

- [x] Hugging Face [Inference API](https://huggingface.co/inference-api) for Text to Image
  - [x] Using [prompthero/openjourney](https://huggingface.co/prompthero/openjourney) as default Stable Diffusion model, you can ask ChatGPT to change the "model" value in JSON to any model hosted on Hugging Face that has public inference API enabled.
- [ ] Hugging Face Space integration for Image to Text
  - [x] [DeepDanbooru](https://huggingface.co/spaces/hysts/DeepDanbooru) (WIP)

## Local Usage

1.  Clone the [ChatDiffusion](https://github.com/prompt-engineering/chat-diffusion) from GitHub.
2.  Run `npm install`.
3.  You can now use the application by running `npm run dev`.

## LICENSE

This code is distributed under the MIT license. See [LICENSE](./LICENSE) in this directory.
