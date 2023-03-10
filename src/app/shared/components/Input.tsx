import React from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valid?: boolean;
  variant?: 'regular' | 'gray' | 'prop';
  pallete?: 'purple' | 'blue';
  margin?: 'none' | 'large';
  from?: 'deposit' | 'withdraw';
  onChangeHandler?: (value: string) => void;
}

const ContainerStyled = styled.div<InputProps>`
  position: relative;
  min-height: 50px;
  margin-bottom: ${({ margin }) => (margin === 'none' ? 0 : 50)}px;
`;

const InputStyled = styled.input<InputProps>`
  width: 100%;
  height: 33px;
  line-height: 31px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  font-size: 14px;
  color: white;

  &::placeholder {
    color: ${({ from }) => (from === 'deposit' ? 'var(--color-purple)' : from === 'withdraw' ? 'var(--color-blue)' : 'var(--color-white)')};
    font-size: 14px;
    transform: translateX(1px);
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputRegularStyled = styled(InputStyled)`
  border-color: ${({ valid }) => (valid ? 'var(--color-green)' : 'var(--color-red)')};
`;

const InputGrayStyled = styled(InputStyled)`
  border-width: 1px;
  border-color: ${({ valid }) => (valid ? 'rgba(255,255,255,0.3)' : 'var(--color-red)')};
  border-bottom: none;
  margin-top: 5px;
  width: 300px;
  
  &::placeholder {
    color: white;
    opacity: 0.3;
    font-size: 14px;
    font-style: italic;
  }
`;

const InputPropStyled = styled(InputStyled)<InputProps>`
  line-height: 20px;
  border: none;
  font-size: 14px;
  color: ${({ variant, valid }) => `${valid ? 'white' : 'var(--color-red)'}`};
  background-color: transparent;
  width: 100%;
  height: 100%;
  -moz-appearance:textfield;

  &::placeholder {
    color: white;
    opacity: 0.3;
    font-size: 14px;
    font-style: italic;
  }
`;

const LabelStyled = styled.div<InputProps>`
  text-align: start;
  margin-top: 4px;
  font-family: SFProDisplay;
  font-size: 14px;
  font-style: italic;
  color: ${({ valid }) => (valid ? 'rgba(255, 255, 255, .7)' : 'var(--color-red)')};
`;

const StyledInput = styled.div<InputProps>`
  background-color: ${({ valid }) => (valid ? 'rgba(255, 255, 255, .05)' : 'rgb(255, 116, 107, .15)')};
  border-radius: 10px;
  display: flex;
  margin-top: 10px;
  padding: 0 15px;
  height: 45px;
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label, valid = true, onChangeHandler, variant = 'regular', margin = 'none', pallete, className, ...rest
  }, ref) => {
    const InputComponent = {
      regular: InputRegularStyled,
      gray: InputGrayStyled,
      prop: InputPropStyled,
    }[variant];

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      const { value: raw } = event.target;
  
      // if (variant == 'amount') {
      //   if ((raw !== '' && !REG_AMOUNT.test(raw)) || parseFloat(raw) > AMOUNT_MAX) {
      //     return;
      //   }
      // }
  
      onChangeHandler(raw);
    };

    return (
      <ContainerStyled className={className} margin={margin}>
        <StyledInput valid={valid}>
          <InputComponent autocomplete="off" ref={ref} valid={valid} onInput={handleInput} pallete={pallete} {...rest} />
        </StyledInput>
        {!!label && <LabelStyled valid={valid}>{label}</LabelStyled>}
      </ContainerStyled>
    );
  },
);

export default Input;
