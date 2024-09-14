import axios from "axios";

export default async function getClientUsername(clientId) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/client/` + clientId
    );

    return response.data.client.clientId;
  } catch (error) {
    console.error("Error fetching artist:", error);
    return null;
  }
}
