import { Id } from "../../../../convex/_generated/dataModel";

export type Conversation = {
  _id: Id<"conversations">;
  image?: string;
  participants: Id<"users">[];
  isGroup: boolean;
  name?: string;
  groupImage?: string;
  groupName?: string;
  admin?: Id<"users">;
  isOnline?: boolean;
  lastMessage?: {
    _id: Id<"messages">;
    conversation: Id<"conversations">;
    content: string;
    sender: Id<"users">;
  };
};