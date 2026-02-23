export function getOwnerId() {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem("ownerId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ownerId", id);
  }

  return id;
}