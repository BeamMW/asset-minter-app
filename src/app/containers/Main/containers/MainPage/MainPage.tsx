import React, { useEffect } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Window, Button } from '@app/shared/components';
import { selectAppParams, selectRate } from '../../store/selectors';
import { IconSend, IconReceive } from '@app/shared/icons';
import { ROUTES, CID } from '@app/shared/constants';
import { selectSystemState } from '@app/shared/store/selectors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  margin-top: 50px;

  > .asset-list {
    width: 200px;
    height: 38px;
  }

  > .create-asset {
    width: 200px;
    height: 38px;
  }
`;

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleCreateClick: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.CREATE_PAGE);
  };

  const handleAssetListClick: React.MouseEventHandler = () => {
    navigate(ROUTES.MAIN.ASSET_LIST_PAGE);
  };


  return (
    <>
      <Window>
        <Container>
          <ButtonsContainer>
            <Button
              className='asset-list'
              onClick={handleAssetListClick}
              pallete="purple" 
              variant="regular">asset list</Button>
            <Button
              className='create-asset'
              onClick={handleCreateClick}
              pallete="green" 
              variant="regular">create asset</Button>
          </ButtonsContainer>
        </Container>
      </Window>
    </>
  );
};

export default MainPage;
