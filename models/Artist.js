import { Schema, model, models } from "mongoose";

// Only the fields the artist portal reads or writes directly; all other
// artist data is managed through the Gigsar API.
const ArtistSchema = new Schema({
  linkid: String,
  name: String,
  contact: String,
  email: String,
  contactVisibility: {
    email: Boolean,
    call: Boolean,
    whatsapp: Boolean,
    enquiryOnly: Boolean,
  },
});

const Artist = models.Artist || model("Artist", ArtistSchema);

export default Artist;
