import { useState, useEffect, useContext } from 'react';
import {
    Box,
    Form,
    FormField,
    TextInput,
    TextArea,
    Text,
    Button,
    Select,
    CheckBox
} from 'grommet';
// import { HelpCircle } from 'react-feather';
import Api from '../pages/Api';
import repository from '../../repository';
import { useTranslation } from 'react-i18next';
import chrome from '../../chrome';
import { langNameMap } from '../atoms/language';

const { savePreference } = Api;
import { UserContext, NotificationContext } from '../atoms/AppContext';
const { setPreferenceData, getPreferenceData } = repository;

const defaultValue = {};

export function Preferences() {
    const [localPreferences, setLocalPreferences] = useState(defaultValue);
    const { user } = useContext(UserContext);
    const { showNotification } = useContext(NotificationContext);
    const [enable, setEnable] = useState(true);
    const [enableML, setEnableMLOption] = useState(false);
    const [storeLocally, setStoreLocally] = useState(true);
    const [language, setLanguage] = useState('English');
    const { t, i18n } = useTranslation();

    // GET PREFERENCE FOR THIS USER FROM LS
    useEffect(async () => {
        try {
            const preference = await getPreferenceData();
            // console.log({ preference });
            setLocalPreferences(preference);
            if (
                preference != undefined &&
                Object.keys(preference).length != 0
            ) {
                const { enable, enableML, storeLocally, language } = preference;
                if (enable != undefined) {
                    setEnable(enable);
                }
                if (enableML != undefined) {
                    setEnableMLOption(enableML);
                }
                if (storeLocally != undefined) {
                    setStoreLocally(storeLocally);
                }
                if (language != undefined) {
                    setLanguage(language);
                }
            }
        } catch (err) {
            showNotification({
                type: 'error',
                message: t('message_error_preference_data_load')
            });
            // alert(err);
        }
    }, [user]);

    async function clickSave(preference) {
        const preferenceInLS = await getPreferenceData();
        // alert(JSON.stringify({preferenceInLS, preference}))

        try {
            const preferenceRemote = await savePreference(
                user.accessToken,
                preference
            );

            await setPreferenceData({
                ...preferenceRemote.data,
                enable,
                enableML,
                storeLocally,
                language,
                uliEnableToggle: preferenceInLS.uliEnableToggle
            });

            showNotification({
                type: 'message',
                message: t('message_ok_saved')
            });
            chrome.sendMessage('updateData', undefined);
        } catch (err) {
            // alert(err);
            showNotification({
                type: 'error',
                message: t('message_error_preference_data_save')
            });
        }
    }

    async function changeLanguage(option) {
        setLanguage(option);
        i18n.changeLanguage(langNameMap[option]);
    }

    async function changeLocalStorageOption(checked) {
        setStoreLocally(checked);
    }

    async function changeEnableMLOption(checked) {
        setEnableMLOption(checked);
    }

    return (
        <Box fill gap={'medium'}>
            {/* <Anchor
                href={'http://uli.tattle.co.in/user-guide/#conf'}
                target={'_blank'}
            >
                <Box direction={'row'} gap={'small'}>
                    <HelpCircle size={20} color={'#343434'} />
                    <Text>Read Configuration Guide Here</Text>
                </Box>
            </Anchor> */}
            {/* <CheckBox
        checked={enable}
        label={t("enable_plugin")}
        onChange={(e) => setEnable(e.target.checked)}
      /> */}
            <Box direction="column" gap={'small'}>
                <Text>{t('language')}</Text>
                <Select
                    options={['English', 'Tamil', 'Hindi']}
                    value={language}
                    onChange={({ option }) => {
                        changeLanguage(option);
                    }}
                    size={'small'}
                />
            </Box>
            <Box direction="row" gap={'large'} align="center">
                <CheckBox
                    checked={storeLocally}
                    label={t('store_locally')}
                    onChange={(e) => changeLocalStorageOption(e.target.checked)}
                />
            </Box>
            <Box direction="row" gap={'large'} align="center">
                <CheckBox
                    checked={enableML}
                    label={t('enable_ml')}
                    onChange={(e) => changeEnableMLOption(e.target.checked)}
                />
            </Box>

            <Box
                height={'2px'}
                background={'dark-4'}
                margin={{ top: '1.2em', bottom: '1.2em' }}
            />
            <Form
                value={localPreferences}
                onChange={(nextValue) => {
                    setLocalPreferences(nextValue);
                }}
                onSubmit={({ value }) => {
                    clickSave(value);
                }}
                onReset={() => setLocalPreferences(defaultValue)}
            >
                {/* <FormField
          name="language"
          htmlFor="languageId"
          label={t("language")}
          component={Select}
          options={["English", "Tamil", "Hindi"]}
          disabled={!enable}
          onChange={()=>{}}
        /> */}

                <FormField
                    id="app_field_email"
                    name="email"
                    htmlFor="emailId"
                    label={
                        <Box direction={'row'} gap={'small'}>
                            <Text>{t('your_email_address')}</Text>
                        </Box>
                    }
                    type="email"
                    disabled={!enable}
                    component={TextInput}
                />

                {/* <FormField
                    name="friends"
                    htmlFor="friendsId"
                    label={
                        <Box direction={'row'} gap={'small'}>
                            <Text>{t('friends')}</Text>
                            <Anchor
                                href={
                                    'http://uli.tattle.co.in/user-guide/#conf'
                                }
                                target={'_blank'}
                            >
                                <HelpCircle size={16} color={'#343434'} />
                            </Anchor>
                        </Box>
                    }
                    disabled={!enable}
                    component={TextArea}
                /> */}

                <FormField
                    name="slurList"
                    htmlFor="slurListId"
                    label={
                        <Box direction={'row'} gap={'small'}>
                            <Text>{t('your_slur_list')}</Text>
                        </Box>
                    }
                    disabled={!enable}
                    component={TextArea}
                />

                <Box
                    margin={{ top: 'medium' }}
                    direction="row"
                    gap={'small'}
                    justify="start"
                >
                    <Button
                        id="app_btn_save"
                        fill={false}
                        label={t('save')}
                        type="submit"
                        primary
                    />

                    {/* <Button onClick={() => console.log("clicked")} /> */}
                </Box>
            </Form>
        </Box>
    );
}
