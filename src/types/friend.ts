export interface Friend {
  id: string;
  profileId: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  birthday: Date | null;
  email: string;
}
export interface FriendPending {
  id: string;
  profileId: string;
  name: string;
  avatar: string;
}

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
  sender: Profile;
  receiver: Profile;
}

export interface Profile {
  id: string;
  accountId: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  birthday: Date | null;
  account: {
    email: string;
  };
}
