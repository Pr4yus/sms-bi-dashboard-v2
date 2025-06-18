export interface Link {
  conversation_uid: string;
  alias: string;
  channel_type: string;
  content: string;
  direction: string;
  datetime: Date;
}

export interface PirateLink {
  _id: string;
  total_links: number;
  links: Link[];
  datetime: string;
  account_uid: string;
  account_name: string;
} 