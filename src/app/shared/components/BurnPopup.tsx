/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button, AmountInput, Popup, AssetIcon } from '@app/shared/components';
import { IconCancel, IconWithdrawBlue } from '@app/shared/icons';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { toGroths } from '@core/appUtils';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { selectAppParams, selectPopupState } from '@app/containers/Main/store/selectors';
import { BurnAsset } from '@core/api';

interface BurnPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

interface BurnFormData {
    burn_amount: string;
}

const BurnButtonsClass = css`
    max-width: 145px !important;
`;

const AmountContainer = styled.div`
  > .burn-form {
    display: flex;
    flex-direction: row;
    align-items: center;

    > .asset-icon {
      margin-left: auto;
    }
  }
`;

const BurnPopupClass = css`
    width: 450px !important;
`;

const BurnPopup: React.FC<BurnPopupProps> = ({ visible, onCancel }) => {
  const popupsState = useSelector(selectPopupState('burn'));
  
  const handleValueChange = (e: string) => {
    setFieldValue('burn_amount', e, true);
  };

  const formik = useFormik<BurnFormData>({
    initialValues: {
      burn_amount: '',
    },
    isInitialValid: false,
    //validate: (e) => validate(e, setHint),
    onSubmit: (value) => {
      const burnAmount = toGroths(parseFloat(value.burn_amount));
      BurnAsset(burnAmount, parseInt(popupsState.aid));
      onCancel();
      resetForm();
    },
  });

  const {
    values, setFieldValue, errors, submitForm, resetForm
  } = formik;

  return (
    <Popup
      className={BurnPopupClass}
      visible={visible}
      title="Burn asset"
      cancelButton={(
        <Button variant='ghost' className={BurnButtonsClass} icon={IconCancel} onClick={()=>{
            onCancel();
          }}>
          cancel
        </Button>
      )}
      confirmButton={(
        <Button variant='regular' className={BurnButtonsClass} pallete='red'
          icon={IconWithdrawBlue} onClick={submitForm}>
          burn
        </Button>
      )}
      onCancel={()=> {
        onCancel();
      }}
    >
      <AmountContainer>
        <form className='burn-form' onSubmit={submitForm}>
          <AmountInput
            from='withdraw'
            value={values.burn_amount}
            error={errors.burn_amount?.toString()}
            onChange={(e, aid) => {
              handleValueChange(e);
            }}
          />
          <AssetIcon className='asset-icon' asset_id={popupsState.aid}/>
          {popupsState.n}
          {' (id:'+popupsState.aid+')'}
        </form>
      </AmountContainer>
    </Popup>
  );
};

export default BurnPopup;
