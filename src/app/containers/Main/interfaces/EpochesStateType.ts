import { Asset, FaucetAppParams, FaucetFund } from '@core/types';

type Popup = {
  isVisible: boolean,
  aid?: string
}
export interface MintorStateType {
  assetsList: Asset[];
  ownedAssetsList: Asset[];

  
  pk: string;
  
  appParams: FaucetAppParams;
  popupsState: {
    withdraw: Popup;
    burn: Popup;
  };
  rate: number;
  relayerFee: any;
  funds: FaucetFund[];
  isDonateInProgress: boolean;
  donatedBeam: number;
  donatedBeamX: number;
}
