import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@linaria/react';
import { Button, Window, BackControl, AssetIcon } from '@app/shared/components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAssetFromList, selectIsOwnedAsset } from '../../store/selectors';
import { setPopupState } from '@app/containers/Main/store/actions';
import { ViewAsset } from '@core/api';
import { calcMintedAmount, fromGroths } from '@core/appUtils';
import { ROUTES, CID } from '@app/shared/constants';
import { selectSystemState } from '@app/shared/store/selectors';


const Container = styled.div`
  background-color: rgba(255, 255, 255, .05);
  border-radius: 10px;
  padding: 20px;

  > .row {
    display: flex;
    flex-direction: row;

    > .title {
      font-size: 14px;
      opacity: 0.5;
      width: 180px;
    }
    
    > .value {
      max-width: 600px;
      word-wrap: break-word;

      > .ref {
        text-decoration: none;
        color: #fff;
      }

      > .img {
        max-width: 300px;
        max-height: 200px;
      }
    }
  }

  > .title-row {
    display: flex;
    flex-direction: row;
    align-items: center;

    > .icon {
      width: 24px;
      height: 24px;
    }

    > .sn {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 3.11111px;
      text-transform: uppercase;
      margin-left: 12px;
    }

    > .un {
      font-weight: 400;
      font-size: 12px;
      line-height: 15px;
      opacity: 0.5;
      margin-left: 12px;
    }
  }

  > .row:not(:first-child) {
    margin-top: 20px;
  }
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;

  > .mint-asset {
    margin: 0 10px 0 auto;
  }

  > .burn-asset {
    margin: 0 0 0 0;
  }
`;

const CreatePage = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const asset = useSelector(selectAssetFromList(params.id));
  const isOwnedAsset = useSelector(selectIsOwnedAsset(params.id))
  const navigate = useNavigate();
  const [limit, setLimit] = useState(0);
  const systemState = useSelector(selectSystemState());

  useEffect(() => {
    if (asset) {
      ViewAsset(asset.aid).then((asset)=> {
        if (asset) {
          setLimit(fromGroths(parseInt(calcMintedAmount(asset.res.limitLo, asset.res.limitHi))));
        }
      })
    }
  }, [asset]);

  const onPreviousClick = () => {
    navigate(-1);
  };

  const handleWithdrawClick = () => {
    dispatch(setPopupState({
      type: 'withdraw',
      state: true,
      aid: params.id,
      ratio: asset.parsedMetadata['NTH_RATIO'],
      n: asset.parsedMetadata['N']
    }));
  }

  const handleBurnClick = () => {
    dispatch(setPopupState({
      type: 'burn',
      state: true,
      aid: params.id,
      //ratio: asset.parsedMetadata['NTH_RATIO'],
      //n: asset.parsedMetadata['N']
    }));
  }

  const heightDiff = systemState.current_height - asset.height;
  const timestampDiff = systemState.current_state_timestamp * 1000 - heightDiff * 60000;
  const dateDiff = new Date(timestampDiff);
  const dateFromString = ('0' + dateDiff.getDate()).slice(-2) + '.' 
    + ('0' + (dateDiff.getMonth()+1)).slice(-2) + '.' + dateDiff.getFullYear();

  return (
    <Window>
      <TopContainer>
        <BackControl onPrevious={onPreviousClick}/>
        {isOwnedAsset && 
          <Button
            className='mint-asset'
            onClick={handleWithdrawClick}
            pallete="green" 
            variant="regular">mint asset</Button>
        }
        <Button
          className='burn-asset'
          onClick={handleBurnClick}
          pallete="red" 
          variant="regular">burn asset</Button>
      </TopContainer>
      <Container>
        <div className='title-row'>
          <AssetIcon asset_id={asset.aid}/>
          {/* <img className='icon' src={asset.parsedMetadata['OPT_FAVICON_URL']}/> */}
          <span className='sn'>{asset.parsedMetadata['SN']}</span>
          <span className='un'>{asset.parsedMetadata['UN']}</span>
        </div>
        <div className='row'>
          <div className='title'>Metadata Schema Version</div>
          <div className='value'>1</div>
        </div>
        <div className='row'>
          <div className='title'>Asset id</div>
          <div className='value'>{params.id}</div>
        </div>
        <div className='row'>
          <div className='title'>Asset name</div>
          <div className='value'>{asset.parsedMetadata['N']}</div>
        </div>
        <div className='row'>
          <div className='title'>Short name / asset code</div>
          <div className='value'>{asset.parsedMetadata['SN']}</div>
        </div>
        <div className='row'>
          <div className='title'>Asset Unit Name</div>
          <div className='value'>{asset.parsedMetadata['UN']}</div>
        </div>
        <div className='row'>
          <div className='title'>Smallest Unit Name</div>
          <div className='value'>{asset.parsedMetadata['NTHUN']}</div>
        </div>
        <div className='row'>
          <div className='title'>Ratio</div>
          <div className='value'>{asset.parsedMetadata['NTH_RATIO'] > 0 ? asset.parsedMetadata['NTH_RATIO'] : '100000000'}</div>
        </div>
        <div className='row'>
          <div className='title'>Minted by</div>
          <div className='value'>
            {
              asset.owner_pk !== undefined && <>Wallet</>
            }
            {
              asset.owner_cid !== undefined && asset.owner_cid === CID && <>Asset Minter</>
            }
            {
              asset.owner_cid !== undefined && asset.owner_cid !== CID && <>Contract {asset.owner_cid}</>
            }
          </div>
        </div>
        <div className='row'>
          <div className='title'>First emission</div>
          <div className='value'>{dateFromString}</div>
        </div>
        <div className='row'>
          <div className='title'>Minted amount</div>
          <div className='value'>{asset['minted']}</div>
        </div>
        <div className='row'>
          <div className='title'>Max supply</div>
          <div className='value'>{limit > 0 ? limit : 'Unlimited'}</div>
        </div>
        <div className='row'>
          <div className='title'>Short Description</div>
          <div className='value'>
            {asset.parsedMetadata['OPT_SHORT_DESC'] ? asset.parsedMetadata['OPT_SHORT_DESC'] : '-'}
          </div>
        </div>
        <div className='row'>
          <div className='title'>Long Description</div>
          <div className='value'>
            {asset.parsedMetadata['OPT_LONG_DESC'] ? asset.parsedMetadata['OPT_LONG_DESC'] : '-'}
          </div>
        </div>
        <div className='row'>
          <div className='title'>Website</div>
          <div className='value'> {asset.parsedMetadata['OPT_SITE_URL'] ? (
            <a href={asset.parsedMetadata['OPT_SITE_URL']} className='ref'>
              {asset.parsedMetadata['OPT_SITE_URL']}
            </a>) : '-'}
          </div>
        </div>
        <div className='row'>
          <div className='title'>Description Paper</div>
          <div className='value'>{ asset.parsedMetadata['OPT_PDF_URL'] ? (
            <a href={asset.parsedMetadata['OPT_PDF_URL']} className='ref'>
              {asset.parsedMetadata['OPT_PDF_URL']}
            </a>) : '-'}
          </div>
        </div>
        <div className='row'>
          <div className='title'>Logo</div>
          <div className='value'>
            {asset.parsedMetadata['OPT_LOGO_URL'] ? (<img className='img' src={asset.parsedMetadata['OPT_LOGO_URL']}/>) : '-'}
          </div>
        </div>
      </Container>
    </Window>
  );
};

export default CreatePage;
