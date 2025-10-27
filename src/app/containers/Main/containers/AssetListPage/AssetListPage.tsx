import React, { useState } from 'react';
import { styled } from '@linaria/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Window, Button, Table, AssetIcon, Input, BackControl } from '@app/shared/components';
import { selectAssetsList, selectOwnedAssetsList } from '../../store/selectors';
import { ROUTES } from '@app/shared/constants';
import { Asset } from '@app/core/types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 95%;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const StyledTable = styled.div`
  width: 100%;
  overflow: hidden;
`;

const EmptyTableContent = styled.div`
  text-align: center;
  margin-top: 72px;
  font-size: 14px;
  font-style: italic;
  color: #8da1ad;
`;

const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const assetsList = useSelector(selectAssetsList());
  const ownedAssetsList = useSelector(selectOwnedAssetsList());
  const [searchValue, setSearchValue] = useState('');

  const TABLE_CONFIG = [
    {
      name: 'aid',
      title: 'Id',
      fn: (value: string, asset: Asset) => {
        return (<>
          <span>{asset.aid}</span>
        </>);
      }
    }, {
      name: 'coin',
      title: 'Coin',
      fn: (value: string, asset: Asset) => {
        return (<>
          <span>
            <AssetIcon asset_id={asset.aid}/>
            {asset.parsedMetadata['N']}
          </span>
        </>);
      }
    }, {
      name: 'minted',
      title: 'Minted amount',
      fn: (value: any, asset: Asset, index: number) => {
        return (<>
          {asset['minted']}
        </>);
      }
    }, {
      name: 'max_supply',
      title: 'Max supply',
      fn: (value: any, asset: Asset, index: number) => {
        return <span>
          {asset['max_supply']}
        </span>
      }
    }, {
      name: 'minted_by',
      title: 'Minted by',
      fn: (value: any, asset: Asset, index: number) => {
        return (<>
          {
            asset['minted_by']
          }
        </>);
      }
    }, {
      name: 'emission',
      title: 'First emission',
      fn: (value: any, asset: Asset, index: number) => {
        const dateFromString = ('0' + asset['emission'].getDate()).slice(-2) + '.' 
          + ('0' + (asset['emission'].getMonth()+1)).slice(-2) + '.' + asset['emission'].getFullYear();
        return (<span className='date'>
          {dateFromString}
        </span>);
      }
    }
  ];

  const onPreviousClick = () => {
    navigate(ROUTES.MAIN.MAIN_PAGE);
  };

  const handleAssetClick: React.MouseEventHandler = (item) => {
    navigate(`${ROUTES.MAIN.ASSET_PAGE.replace(':id', '')}${item['aid']}`);
  };
  
  const onSearchInput = (value: string) => {
    setSearchValue(value);
  };

  return (
    <>
      <Window>
        <Container>
          <TopContainer>
            <BackControl onPrevious={onPreviousClick} />
            <SearchContainer>
              <Input onChangeHandler={onSearchInput} placeholder='Search by id, coin, minted by' variant='gray' />
            </SearchContainer>
          </TopContainer>
          <StyledTable>
            <Table config={TABLE_CONFIG} searchedBy={searchValue} rowOnClick={handleAssetClick}
              data={assetsList} dataToHighlight={ownedAssetsList} keyBy='aid'/>
              { assetsList.length === 0 && 
                <EmptyTableContent>There are no assets yet</EmptyTableContent> }
          </StyledTable>
        </Container>
      </Window>
    </>
  );
};

export default AssetListPage;
