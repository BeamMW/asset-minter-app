import React, { useState } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useEffect } from 'react';

interface CellConfig {
  name: string;
  title: string;
  fn?: (value: any, source: any, index?: number) => any;
}

interface TableProps {
  keyBy: string;
  data: any[];
  dataToHighlight: any[];
  config: CellConfig[];
  rowOnClick?: (value: any) => any;
  searchedBy?: string;
}

const StyledTable = styled.table`
  width: 95%;
  margin: 0 auto;
  > tbody tr:last-child td:first-child {
    border-bottom-left-radius: 10px;
  }
      
  > tbody tr:last-child td:last-child {
    border-bottom-right-radius: 10px;
  }
  
  > thead tr:first-child th:first-child {
    border-top-left-radius: 10px;
  }
      
  > thead tr:first-child th:last-child {
    border-top-right-radius: 10px;
  }
`;

const StyledThead = styled.thead`
  height: 40px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.08);
`;

const isPositive = (value: number) => 1 / value > 0;

const Header = styled.th<{ active: boolean }>`
  text-align: left;
  color: ${({ active }) => {
    if (!active) {
      return '#8da1ad';
    }
    return active ? '#ffffff' : '#8da1ad';
  }};
  padding: 15px 12px;
`;

const Column = styled.td`
  padding: 15px 12px;
  background-color: rgba(13, 77, 118, .9);
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const TableTr = styled.tr<{isMine: boolean}>`
  background-color: ${({ isMine }) => (isMine ? 'rgb(0, 255, 70)' : '')} !important;
`;

const bodyClass = css`
  tr:nth-child(even) {
    background-color: rgba(13, 50, 152, .9);
  }
`;

const Table: React.FC<TableProps> = ({ keyBy, data, dataToHighlight, config, rowOnClick, searchedBy }) => {
  const updateTableData = (newData) => {
    let res = [...newData];
    res = res.sort(sortFn);    
    return res;
  };

  const [filterBy, setFilterBy] = useState(0);
  const [td, setTd] = useState(updateTableData(data));
  const [tdTmp, setTdTmp] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    if (searchedBy.length === 0) {
      setTd(updateTableData(data));
    }
    setTdTmp(data);
  }, [data]);

  useEffect(() => {
    if (searchedBy.length > 0) {
      setIsSearchActive(true);
      const filteredData = tdTmp.filter((item) => {
        return item.aid.toString().includes(searchedBy) || 
          item.minted_by.toLowerCase().includes(searchedBy) || (item.coin ? item.coin.toLowerCase().includes(searchedBy) : false);
      })
      setTd(updateTableData(filteredData));
    } else if (searchedBy.length === 0 && isSearchActive) {
      setTd(updateTableData(tdTmp));
    }
  }, [searchedBy]);

  const sortFn = (objectA, objectB) => {
    const name = config[Math.abs(filterBy)].name;
    const a = typeof objectA[name] == 'string' ? objectA[name].toLowerCase() : objectA[name];
    const b = typeof objectB[name] == 'string' ? objectB[name].toLowerCase() : objectB[name];

    if (a === b) {
      return 0;
    }

    const sign = isPositive(filterBy) ? 1 : -1;
    return a > b ? sign : -sign;
  };

  const handleSortClick: React.MouseEventHandler<HTMLElement> = event => {
    const index = parseInt(event.currentTarget.dataset.index);
    setFilterBy(index === filterBy ? -filterBy : index);
  };

  return  (
    <StyledTable>
      <StyledThead>
        <tr>
          {config.map(({ title }, index) => (
            <Header
              key={index}
              data-index={index}
              active={
                index !== Math.abs(filterBy) ? null : isPositive(filterBy)
              }
              onClick={handleSortClick}>
                {title}
            </Header>
          ))}
        </tr>
      </StyledThead>
      <tbody className={bodyClass}>
        {td && td.length > 0 ? td.sort(sortFn).map((item, index) => (
          <TableTr key={index} isMine={dataToHighlight.some(el => el.aid === item.aid)}>
            {config.map(({ name, fn }, itemIndex) => {
              const value = item[name];
              return (<Column onClick={()=>rowOnClick(item)} key={itemIndex}>{!fn ? value : fn(value, item, index)}</Column>);
            })}
          </TableTr>
        )): (<></>)}
      </tbody>
    </StyledTable>
  ) ;
};

export default Table;
