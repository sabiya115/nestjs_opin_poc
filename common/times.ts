import * as mongoose from "mongoose";

export function timePlugin(schema: mongoose.Schema) {
  const defaults = {
    created: "created_at",
    lastUpdated: "updated_at",
    deleted: "deleted_at",
  };

  // schema.add(dateJSON(created))
  schema.add({
    [defaults["created"]]: {
      type: mongoose.Schema.Types.Mixed,
    },
  });
  // schema.add(dateJSON(lastUpdated))
  schema.add({
    [defaults["lastUpdated"]]: {
      type: mongoose.Schema.Types.Mixed,
    },
  });
  // schema.add(dateJSON(deleted))
  schema.add({
    [defaults["deleted"]]: {
      type: mongoose.Schema.Types.Mixed,
    },
  });

  return schema.pre("save", function (next) {
    // timestamp = new Date().toISOString()
    const timestamp = new Date().getTime(); // change wrt to EPOCH timestamp changes

    if (this.isNew) {
      this[defaults["created"]] = timestamp;
      this[defaults["deleted"]] = "false";
    }

    if (this.isDelete) {
      this[defaults["deleted"]] = timestamp; //new Date(timestamp).toISOString();
    }

    this[defaults["lastUpdated"]] = timestamp;

    return next();
  });
}
