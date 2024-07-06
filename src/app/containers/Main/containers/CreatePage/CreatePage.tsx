import React, { useState } from 'react';
import { styled } from '@linaria/react';
import { Button, Window, Input, BackControl } from '@app/shared/components';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { CreateAsset } from '@core/api';
import { ROUTES } from '@app/shared/constants';
import CopyIconButton from '@app/shared/components/CopyIconButton';
import { css } from '@linaria/core';

interface CreateFormData {
  schema: string;
  asset_name: string;
  unit_name: string;
  short_name: string;
  sm_unit_name: string;
  ratio: string;
  short_descr: string;
  long_descr: string;
  site_url: string;
  pdf_url: string;
  favicon_url: string;
  logo_url: string;
  color: string;
  limit: string;
}

const COMMAND_BASIS_START = './beam-wallet asset_reg --pass 1 -n 127.0.0.1:10000 --asset_meta "';
const PRE_COMMAND = 'STD:SCH_VER=1;'
const COMMAND_BASIS_END = '" --fee 100000 --enable_assets';
const RATIO_MAX = Math.pow(2, 128) - 2;

const Command = styled.div`
  padding: 20px;
  background-color: rgba(0, 246, 210, .1);
  border-radius: 10px;
  margin-bottom: 10px;

  > .empty-text {
    font-style: italic;
    text-align: center;
    opacity: 0.5;
    margin: 30px 0 10px;
  }

  > .copy-text {
    font-style: italic;
    text-align: center;
    opacity: 0.5;
    margin: 30px 0;
  }
`;

const Container = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  width: 100%;

  > .mandatory {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 50%;
    min-height: 0;

    > .items {
      padding: 20px;
      background-color: rgba(255, 255, 255, .05);
      border-radius: 10px;
      margin-bottom: 20px;
    }
  }

  > .side {
    margin-left: 10px;
    width: 50%;
    display: flex;
    flex-direction: column;
    
    > .optional {
      padding: 20px;
      background-color: rgba(255, 255, 255, .05);
      border-radius: 10px;
    }
  }
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;

  > .show-reg {
    margin: 0 0 0 20px;
  }

  > .create-asset {
    margin: 0 0 0 auto;
  }
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3.11111px;
`;

const SectionSubTitle = styled.div<{valid?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  color: ${({ valid }) => (valid ? '#8DA1AD' : 'var(--color-red)')};
  margin-top: 20px;
`;


const CommandText = styled.div`
  font-family: 'CourierRegular';
  margin-top: 30px;
  margin-bottom: 10px;
  word-wrap: break-word;
`;

const CreatePage = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [regCommand, setRegCommand] = useState('');
  const [isCommandVisible, setIsCommandVisible] = useState(false);
  const [metadata, setMetadata] = useState('');
  const navigate = useNavigate();

  const generateMetadata = ({asset_name, unit_name, 
    short_name, sm_unit_name, ratio, short_descr, long_descr,
    site_url, pdf_url, favicon_url, logo_url, color}) => {
      return `${PRE_COMMAND}${asset_name.length > 0 ? 'N=' + asset_name + ';' : ''}${
        unit_name.length > 0 ? 'UN=' + unit_name + ';' : ''}${
        short_name.length > 0 ? 'SN=' + short_name + ';' : ''}${
        sm_unit_name.length > 0 ? 'NTHUN=' + sm_unit_name + ';' : ''}${
        ratio.length > 0 ? 'NTH_RATIO=' + ratio + ';' : ''}${
        short_descr.length > 0 ? 'OPT_SHORT_DESC=' + short_descr + ';' : ''}${
        long_descr.length > 0 ? 'OPT_LONG_DESC=' + long_descr + ';' : ''}${
        site_url.length > 0 ? 'OPT_SITE_URL=' + site_url + ';' : ''}${
        pdf_url.length > 0 ? 'OPT_PDF_URL=' + pdf_url + ';' : ''}${
        favicon_url.length > 0 ? 'OPT_FAVICON_URL=' + favicon_url + ';' : ''}${
        logo_url.length > 0 ? 'OPT_LOGO_URL=' + logo_url + ';' : ''}${
        color.length > 0 ? 'OPT_COLOR=' + color + ';' : ''}`;
  };

  const generateRegCommand = (metadata: string) => {
    return `${COMMAND_BASIS_START}${metadata}${COMMAND_BASIS_END}`;
  };

  const validate = async (formValues: CreateFormData) => {
    const errorsValidation: any = {};
    const {
        schema,
        asset_name,
        unit_name,
        short_name,
        sm_unit_name,
        ratio,
        limit,
        short_descr,
        long_descr,
        site_url,
        pdf_url,
        favicon_url,
        logo_url,
        color
    } = formValues;

    if (asset_name.length > 0 ||
        unit_name.length > 0 ||
        short_name.length > 0 ||
        sm_unit_name.length > 0 ||
        ratio.length > 0) {
      const metadata = generateMetadata(formValues);
      setMetadata(metadata);
      setRegCommand(generateRegCommand(metadata));
    } else {
      setRegCommand('');
    }

    // if (!isLoaded && send_amount.length > 0) {
    //   isLoaded = true;
    // }
    // if ((send_amount == '' || parseFloat(send_amount) == 0) && isLoaded) {
    //   errorsValidation.send_amount = `Insufficient amount`;
    // }

    const name_regex = new RegExp('^[a-zA-Z0-9]*$');
    const num_regex = new RegExp('^[0-9]*$');
    const num_lim_regex = new RegExp('^([0-9]*[.])?[0-9]+$');
    const url_regex = new RegExp('^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$');
    const color_regex = new RegExp('^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$');

    if (!asset_name) {
      errorsValidation.asset_name = `Required`;
    } else if (!name_regex.test(asset_name)) {
      errorsValidation.asset_name = `Incorrect value`;
    }

    if (!unit_name) {
      errorsValidation.unit_name = `Required`;
    } else if (!name_regex.test(unit_name)) {
      errorsValidation.unit_name = `Incorrect value`;
    }

    if (!short_name) {
      errorsValidation.short_name = `Required`;
    } else if (short_name.length > 6) {
      errorsValidation.short_name = `Maximum characters are 6`;
    } else if (!name_regex.test(short_name)) {
      errorsValidation.short_name = `Incorrect value`;
    }

    if (!sm_unit_name) {
      errorsValidation.sm_unit_name = `Required`;
    } else if (!name_regex.test(sm_unit_name)) {
      errorsValidation.sm_unit_name = `Incorrect value`;
    }

    if (!ratio) {
      errorsValidation.ratio = `Required`;
    } else if (parseFloat(ratio) > RATIO_MAX) {
      errorsValidation.ratio = `Value is too big`;
    } else if (!num_regex.test(ratio)) {
      errorsValidation.ratio = `Incorrect value`;
    }

    if (!limit) {
      errorsValidation.limit = `Required`;
    } else if (!num_lim_regex.test(limit)) {
      errorsValidation.limit = `Incorrect value`;
    }

    if (short_descr.length > 124) {
      errorsValidation.short_descr = `Value is too big`;
    }

    if (long_descr.length > 124) {
      errorsValidation.long_descr = `Value is too big`;
    }

    if (site_url.length > 0 && !url_regex.test(site_url)) {
      errorsValidation.site_url = `Wrong url format`;
    }

    if (pdf_url.length > 0 && !url_regex.test(pdf_url)) {
      errorsValidation.pdf_url = `Wrong url format`;
    }

    if (favicon_url.length > 0 && !url_regex.test(favicon_url)) {
      errorsValidation.favicon_url = `Wrong url format`;
    }

    if (logo_url.length > 0 && !url_regex.test(logo_url)) {
      errorsValidation.logo_url = `Wrong url format`;
    }

    if (color.length > 0 && !color_regex.test(color)) {
      errorsValidation.color = `Wrong color`;
    }

    return errorsValidation;
  };

  const formik = useFormik<CreateFormData>({
    initialValues: {
        schema: '1',
        asset_name: '',
        unit_name: '',
        short_name: '',
        sm_unit_name: '',
        ratio: '100000000',
        short_descr: '',
        long_descr: '',
        site_url: '',
        pdf_url: '',
        favicon_url: '',
        logo_url: '',
        color: '',
        limit: ''
    },
    isInitialValid: false,
    onSubmit: (value) => {
    },
    validate: (e) => validate(e),
  });

  const subm = () => {
    CreateAsset(metadata, values.limit);
    navigate(ROUTES.MAIN.MAIN_PAGE);
  }

  const handleAssetNameChange = (asset_name: string) => setFieldValue('asset_name', asset_name, true);
  const handleUnitNameChange = (unit_name: string) => setFieldValue('unit_name', unit_name, true);
  const handleShortNameChange = (short_name: string) => setFieldValue('short_name', short_name, true);
  const handleSmallestUNChange = (sm_unit_name: string) => setFieldValue('sm_unit_name', sm_unit_name, true);
  const handleRatioChange = (ratio: string) => setFieldValue('ratio', ratio, true);
  const handleShortDescrChange = (short_descr: string) => setFieldValue('short_descr', short_descr, true);
  const handleLongDescrChange = (long_descr: string) => setFieldValue('long_descr', long_descr, true);
  const handleSiteUrlChange = (site_url: string) => setFieldValue('site_url', site_url, true);
  const handlePdfUrlChange = (pdf_url: string) => setFieldValue('pdf_url', pdf_url, true);
  const handleFaviconUrlChange = (favicon_url: string) => setFieldValue('favicon_url', favicon_url, true);
  const handleLogoUrlChange = (logo_url: string) => setFieldValue('logo_url', logo_url, true);
  const handleColorChange = (color: string) => setFieldValue('color', color, true);
  const handleLimitChange = (limit: string) => setFieldValue('limit', limit, true);

  const {
    values, setFieldValue, errors, submitForm, resetForm
  } = formik;

  const isFormDisabled = () => {
    if (!formik.isValid) return !formik.isValid;
    //if (!isLoaded) return true;
    return false;
  };

  const isAssetNameValid = () => !errors.asset_name;
  const isUnitNameValid = () => !errors.unit_name;
  const isShortNameValid = () => !errors.short_name;
  const isSmallestUNValid = () => !errors.sm_unit_name;
  const isRatioValid = () => !errors.ratio;
  const isShortDescrValid = () => !errors.short_descr;
  const isLongDescrValid = () => !errors.long_descr;
  const isSiteUrlValid = () => !errors.site_url;
  const isPdfUrlValid = () => !errors.pdf_url;
  const isFaviconUrlValid = () => !errors.favicon_url;
  const isLogoUrlValid = () => !errors.logo_url;
  const isColorValid = () => !errors.color;
  const isLimitValid = () => !errors.limit;

  const onPreviousClick = () => {
    navigate(ROUTES.MAIN.MAIN_PAGE);
  };

  const onShowCommandClick = () => {
    setIsCommandVisible(!isCommandVisible);
  };

  return (
    <Window>
      <TopContainer>
        <BackControl onPrevious={onPreviousClick}/>
        <Button
          className='create-asset'
          disabled={isFormDisabled()}
          onClick={()=>subm()}
          pallete="green" 
          variant="regular">create asset</Button>
        <Button
          className='show-reg'
          onClick={()=>onShowCommandClick()}
          pallete="blue" 
          variant="regular">show registration command</Button>
      </TopContainer>
      <form onSubmit={submitForm}>
        {/* <Button
          onClick={()=>UserWithdraw(50, 55)}
          pallete="green" 
          variant="regular">withdraw</Button> */}
        { isCommandVisible &&
          <Command>
            <SectionTitle>REGISTRATION COMMAND</SectionTitle>
            {regCommand.length > 0 ? 
            <>
              <CommandText>{regCommand}</CommandText>
              <CopyIconButton onCopy={() => regCommand} />
              <div className='copy-text'>Copy and paste this command in command line</div>
            </> :
            <div className='empty-text'>Enter asset parameters</div>}
          </Command>
        }
        <Container>
          <div className='mandatory'>
            <div className='items'>
              <SectionTitle>MANDATORY PROPERTIES</SectionTitle>
              <SectionSubTitle valid={isAssetNameValid()}>Asset name</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleAssetNameChange}
                valid={isAssetNameValid()}
                value={values.asset_name}
                label={errors.asset_name}
                variant="prop"
                name="asset_name"/>
              <SectionSubTitle valid={isUnitNameValid()}>Asset unit name</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleUnitNameChange}
                valid={isUnitNameValid()}
                value={values.unit_name}
                label={errors.unit_name}
                variant="prop"
                name="unit_name"/>
              <SectionSubTitle valid={isShortNameValid()}>Short name / asset code</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleShortNameChange}
                valid={isShortNameValid()}
                value={values.short_name}
                label={errors.short_name}
                variant="prop"
                name="short_name"/>
              <SectionSubTitle valid={isSmallestUNValid()}>Smallest unit name</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleSmallestUNChange}
                valid={isSmallestUNValid()}
                value={values.sm_unit_name}
                label={errors.sm_unit_name}
                variant="prop"
                name="sm_unit_name"/>
              <SectionSubTitle valid={isRatioValid()}>Ratio</SectionSubTitle>
              <Input placeholder="100000000"
                onChangeHandler={handleRatioChange}
                valid={isRatioValid()}
                value={values.ratio}
                label={errors.ratio}
                variant="prop"
                name="ratio"/>
              <SectionSubTitle valid={isLimitValid()}>Max supply</SectionSubTitle>
              <Input placeholder="100000000"
                onChangeHandler={handleLimitChange}
                valid={isLimitValid()}
                value={values.limit}
                label={errors.limit}
                variant="prop"
                name="limit"/>
            </div>
          </div>
          <div className='side'>
            <div className='optional'>
              <SectionTitle>OPTIONAL PROPERTIES</SectionTitle>
              <SectionSubTitle valid={isShortDescrValid()}>Short Description</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleShortDescrChange}
                valid={isShortDescrValid()}
                value={values.short_descr}
                label={errors.short_descr}
                variant="prop"
                name="short_descr"/>
              <SectionSubTitle valid={isLongDescrValid()}>Long Description</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleLongDescrChange}
                valid={isLongDescrValid()}
                value={values.long_descr}
                label={errors.long_descr}
                variant="prop"
                name="long_descr"/>
              <SectionSubTitle valid={isSiteUrlValid()}>Website URL</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleSiteUrlChange}
                valid={isSiteUrlValid()}
                value={values.site_url}
                label={errors.site_url}
                variant="prop"
                name="site_url"/>
              <SectionSubTitle valid={isPdfUrlValid()}>Description Paper URL</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handlePdfUrlChange}
                valid={isPdfUrlValid()}
                value={values.pdf_url}
                label={errors.pdf_url}
                variant="prop"
                name="pdf_url"/>
              <SectionSubTitle valid={isFaviconUrlValid()}>Favicon URL</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleFaviconUrlChange}
                valid={isFaviconUrlValid()}
                value={values.favicon_url}
                label={errors.favicon_url}
                variant="prop"
                name="favicon_url"/>
              <SectionSubTitle valid={isLogoUrlValid()}>Logo URL</SectionSubTitle>
              <Input placeholder=""
                onChangeHandler={handleLogoUrlChange}
                valid={isLogoUrlValid()}
                value={values.logo_url}
                label={errors.logo_url}
                variant="prop"
                name="logo_url"/>
              <SectionSubTitle valid={isColorValid()}>Color</SectionSubTitle>
              <Input placeholder="#ffffff"
                onChangeHandler={handleColorChange}
                valid={isColorValid()}
                value={values.color}
                label={errors.color}
                variant="prop"
                name="color"/>
            </div>
          </div>
        </Container>
      </form>
    </Window>
  );
};

export default CreatePage;
