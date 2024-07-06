import { css } from "@linaria/core";
import { IconCopyWhite } from "../icons"
import React from "react";
import { toast } from "react-toastify";

interface CopyIconButtonProps {
  onCopy?: any;
}

const CopyButtonStyles = css`
  cursor: pointer;
`;

const CopyIconButton = ({ onCopy }: CopyIconButtonProps) => {
  const handleClick = () => {
    const dataToCopy = onCopy();
    const newElement = document.createElement('textarea');

    newElement.value = dataToCopy;
    document.body.appendChild(newElement);
    newElement.select();
    document.execCommand('copy');
    document.body.removeChild(newElement);
    toast('Copied to clipboard');
  }

  return <IconCopyWhite className={CopyButtonStyles} onClick={handleClick} />
}

export default CopyIconButton;