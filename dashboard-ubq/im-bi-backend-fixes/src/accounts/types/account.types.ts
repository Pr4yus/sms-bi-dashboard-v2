export interface WABAChannel {
  identifier: string;
  type: string;
}

export interface AccountWithChannels {
  _id: string;
  name: string;
  instance: string;
  waba_channels: WABAChannel[];
}
