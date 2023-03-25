import { WebStorage } from "@/storage/webstorage";

export function isClientSideOpenAI() {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // Client-side
    // TODO: Hardcode to true as server-side is not working yet.
    return true;
    // const _storage = new WebStorage<string>("o:t", "sessionStorage");
    // const _type = _storage.get<string>();
    // return _type && _type == "client" ? true : false;
  }
  return false;
}

export function getApiKey() {
  const _apiKeyRepo = new WebStorage<string>("o:a", "sessionStorage");
  const _apiKey = _apiKeyRepo.get<string>();
  return _apiKey;
}

export function getToken() {
  const _tokenRepo = new WebStorage<string>("h:t", "sessionStorage");
  const _token = _tokenRepo.get<string>();
  return _token;
}

export function saveApiKey(apiKey: string, token: string) {
  const _apiKeyRepo = new WebStorage<string>("o:a", "sessionStorage");
  _apiKeyRepo.set(apiKey);
  const _tokenRepo = new WebStorage<string>("h:t", "sessionStorage");
  _tokenRepo.set(token);
  return true;
}

export function logout() {
  window.sessionStorage.removeItem("o:a");
  return { message: "Logged out" };
}
