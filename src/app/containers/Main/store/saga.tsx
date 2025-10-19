import { call, put, takeLatest, select } from 'redux-saga/effects';
import { navigate } from '@app/shared/store/actions';
import { ROUTES, CURRENCIES, CID } from '@app/shared/constants';
import { Asset } from '@core/types';
import { LoadAssetsList, LoadOwnedAssets, ViewAsset } from '@core/api';
import { calcRelayerFee, parseMetadata } from '@core/appUtils';
import { calcMintedAmount, fromGroths } from '@core/appUtils';
import { actions } from '.';
import store from '../../../../index';
import { setIsLoaded } from '@app/shared/store/actions';
import { selectIsLoaded, selectSystemState } from '@app/shared/store/selectors';
import { SystemState } from '@core/types';

const FETCH_INTERVAL = 5000;
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const RESERVE_API_URL = 'https://explorer-api.beam.mw/bridges/rates';
const GAS_API_URL = 'https://explorer-api.beam.mw/bridges/gasprice';

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ): Generator {
    try {
      const assetsList = (yield call(LoadAssetsList, action.payload ? action.payload : null)) as Asset[];
      const ownedAssets = (yield call(LoadOwnedAssets)) as Asset[];

      const systemState = (yield select(selectSystemState())) as SystemState;
      for (let i = 0; i < assetsList.length; i++) {
        assetsList[i]['parsedMetadata'] = parseMetadata(assetsList[i].metadata);
        assetsList[i]['coin'] = assetsList[i].parsedMetadata['N'];
        assetsList[i]['minted'] = fromGroths(parseInt(calcMintedAmount(assetsList[i].mintedLo, assetsList[i].mintedHi)));
        const heightDiff = systemState.current_height - assetsList[i].height;
        const timestampDiff = systemState.current_state_timestamp * 1000 - heightDiff * 60000;
        assetsList[i]['emission'] = new Date(timestampDiff);

        if (assetsList[i].owner_cid !== undefined) {
          if (assetsList[i].owner_cid === CID) {
            assetsList[i]['minted_by'] = 'Asset Minter';
            const assetInfo = (yield call(ViewAsset, assetsList[i].aid)) as {res: any};
            assetsList[i]['max_supply'] = fromGroths(parseInt(calcMintedAmount(assetInfo.res.limitLo, assetInfo.res.limitHi)));
          } else {
            assetsList[i]['minted_by'] = `Contract ${assetsList[i].owner_cid}`;
            assetsList[i]['max_supply'] = 'Unlimited';
          }
        }

        if (assetsList[i].owner_pk !== undefined) {
          assetsList[i]['minted_by'] = 'Wallet';
          assetsList[i]['max_supply'] = 'Unlimited';
        }
      };

      ownedAssets.forEach(item => {
        const index = assetsList.findIndex(resItem => resItem.aid == item.aid);
        const spliced = assetsList.splice(index, 1);
        assetsList.unshift(spliced[0]);
      });

      const processedOwnedAssets = ownedAssets.map(ownedAsset => {
        return assetsList.find(asset => asset.aid === ownedAsset.aid);
      }).filter(Boolean);

      yield put(actions.setAssetsList(assetsList));
      yield put(actions.setOwnedAssetsList(processedOwnedAssets));
        
      const isLoaded = yield select(selectIsLoaded());
      if (!isLoaded) {
        store.dispatch(setIsLoaded(true));
        yield put(navigate(ROUTES.MAIN.MAIN_PAGE));
      }
    } catch (e) {
      yield put(actions.loadAppParams.failure(e));
    }
}

async function loadRatesCached() {
  try {
    const response = await fetch(RESERVE_API_URL);
    if (response.status === 200) {
      const promise = await response.json();
      return promise;
    }

    return null;
  } catch (e) {
    return null;
  }
}

async function loadRatesApiCall(rate_ids) {
  try {
    const response = await fetch(`${API_URL}?ids=${rate_ids.join(',')}&vs_currencies=usd`);
    if (response.status === 200) {
      const promise = await response.json();
      return promise;
    } else {
      return await loadRatesCached();
    }
  } catch (error) {
    return await loadRatesCached();
  }
}

interface GasPrice {
  FastGasPrice: string,
  LastBlock: string,
  ProposeGasPrice: string,
  SafeGasPrice: string,
  gasUsedRatio: string,
  suggestBaseFee: string
}

async function loadGasPrice() {
  const response = await fetch(GAS_API_URL);
  const gasPrice = await response.json();
  return gasPrice;
}

async function loadRelayerFee(ethRate: number, currFee: number, gasPrice: GasPrice) {
  const res = await calcRelayerFee(ethRate, currFee, gasPrice);
  return res;
}

export function* loadRate() {
  try {
    let rate_ids = [];
    CURRENCIES.forEach((curr) => {
      rate_ids.push(curr.rate_id);
    });
    rate_ids.push('beam');
    const result = yield call(loadRatesApiCall, rate_ids);
    let feeVals = {};
    const gasPrice = yield call(loadGasPrice);

    for (let item in result) {
      if (item === 'beam') {
        continue;
      }

      const feeVal = yield call(loadRelayerFee, result['ethereum'].usd, result[item].usd, gasPrice);
      const curr = CURRENCIES.find((curr) => curr.rate_id === item)
      feeVals[item] = feeVal.toFixed(curr.fee_decimals);
    }
    yield put(actions.setFeeValues(feeVals));
    yield put(actions.loadRate.success(result));
    setTimeout(() => store.dispatch(actions.loadRate.request()), FETCH_INTERVAL);
  } catch (e) {
    yield put(actions.loadRate.failure(e));
  }
}

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
    yield takeLatest(actions.loadRate.request, loadRate);
}

export default mainSaga;
