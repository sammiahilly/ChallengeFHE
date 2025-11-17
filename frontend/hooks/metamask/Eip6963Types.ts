export interface Eip6963AnnounceProviderEvent extends Event {
  detail: Eip6963ProviderDetail;
}

export interface Eip6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any; // EIP-1193 provider
}


