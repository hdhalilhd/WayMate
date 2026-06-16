import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export function getChatConnection(): signalR.HubConnection {
  if (!connection) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/chat`, {
        accessTokenFactory: () => token || "",
      })
      .withAutomaticReconnect()
      .build();
  }
  return connection;
}

export async function startConnection() {
  const conn = getChatConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
}

export async function stopConnection() {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    await connection.stop();
  }
  connection = null;
}
