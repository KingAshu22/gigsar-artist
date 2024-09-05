import axios from "axios";

export default async function getProfilePic(linkid) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/artist/artistName/` + linkid
    );
    const name = response.data.name;
    const profilePic = response.data.profilePic;
    return { name, profilePic };
  } catch (error) {
    console.error("Error fetching artist:", error);
    return null;
  }
}
