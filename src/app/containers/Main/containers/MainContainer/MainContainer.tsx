import React from 'react';
import { useRoutes } from 'react-router-dom';

import { ROUTES_PATH } from '@app/shared/constants';
import {
  MainPage,
  AssetPage,
  CreatePage,
  AssetListPage,
  Send
} from '@app/containers/Main/containers';

const routes = [
  {
    path: ROUTES_PATH.MAIN.MAIN_PAGE,
    element: <MainPage />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.ASSET_PAGE,
    element: <AssetPage />,
  },
  {
    path: ROUTES_PATH.MAIN.ASSET_LIST_PAGE,
    element: <AssetListPage />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.CREATE_PAGE,
    element: <CreatePage />,
    exact: true,
  },
  {
    path: ROUTES_PATH.MAIN.SEND,
    element: <Send />,
    exact: true,
  },
];

const MainContainer = () => {
  const content = useRoutes(routes);

  return <>{content}</>;
};

export default MainContainer;
