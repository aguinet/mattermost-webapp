// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {PreferenceType} from 'mattermost-redux/types/preferences';
import {Team} from 'mattermost-redux/types/teams';

import {trackEvent} from 'actions/telemetry_actions';
import {toggleShortcutsModal} from 'actions/global_actions';
import {openModal, closeModal} from 'actions/views/modals';
import Card from 'components/card/card';
import MoreChannels from 'components/more_channels';
import TeamMembersModal from 'components/team_members_modal';
import MarketplaceModal from 'components/plugin_marketplace';
import RemoveNextStepsModal from 'components/sidebar/sidebar_next_steps/remove_next_steps_modal';

import {browserHistory} from 'utils/browser_history';
import {
    ModalIdentifiers,
    RecommendedNextSteps,
    Preferences,
} from 'utils/constants';
import CloseIcon from 'components/widgets/icons/close_icon';
import * as Utils from 'utils/utils';

import DownloadSection from './download_section';

import {getAnalyticsCategory} from './step_helpers';
import IncidentsSvg from './images/incidents.svg';
import DocumentsSvg from './images/documents.svg';
import PluginsSvg from './images/plugins.svg';

const openAdminConsole = (isAdmin: boolean) => {
    trackEvent(getAnalyticsCategory(isAdmin), 'click_admin_console');
    browserHistory.push('/admin_console/');
};

const openIncidentsPlugin = (isAdmin: boolean, team: Team) => {
    trackEvent(getAnalyticsCategory(isAdmin), 'click_open_incidents');
    browserHistory.push(`/${team.name}/com.mattermost.plugin-incident-management/playbooks`);
};

type Props = {
    showFinalScreen: boolean;
    animating: boolean;
    currentUserId: string;
    isFirstAdmin: boolean;
    team: Team;
    isAdmin: boolean;
    stopAnimating: () => void;
    savePreferences: (userId: string, preferences: PreferenceType[]) => void;
    setShowNextStepsView: (show: boolean) => void;
}

export default function NextStepsTips(props: Props) {
    const dispatch = useDispatch();
    const openPluginMarketplace = () => {
        trackEvent(getAnalyticsCategory(props.isAdmin), 'click_add_plugins');
        openModal({modalId: ModalIdentifiers.PLUGIN_MARKETPLACE, dialogType: MarketplaceModal})(dispatch);
    };
    const openMoreChannels = openModal({modalId: ModalIdentifiers.MORE_CHANNELS, dialogType: MoreChannels});

    const openViewMembersModal = openModal({
        modalId: ModalIdentifiers.TEAM_MEMBERS,
        dialogType: TeamMembersModal,
    });

    const closeCloseNextStepsModal = closeModal(ModalIdentifiers.REMOVE_NEXT_STEPS_MODAL);

    const onCloseModal = () => closeCloseNextStepsModal(dispatch);

    const closeNextSteps = openModal({
        modalId: ModalIdentifiers.REMOVE_NEXT_STEPS_MODAL,
        dialogType: RemoveNextStepsModal,
        dialogProps: {
            screenTitle: Utils.localizeMessage(
                'sidebar_next_steps.tipsAndNextSteps',
                'Tips & Next Steps',
            ),
            onConfirm: () => {
                props.savePreferences(props.currentUserId, [
                    {
                        user_id: props.currentUserId,
                        category: Preferences.RECOMMENDED_NEXT_STEPS,
                        name: RecommendedNextSteps.HIDE,
                        value: 'true',
                    },
                ]);
                props.setShowNextStepsView(false);
                onCloseModal();
            },
            onCancel: onCloseModal,
        },
    });

    let nonMobileTips;
    if (!Utils.isMobile() && props.isAdmin) {
        nonMobileTips = (
            <>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <div className='Card__image'>
                            <PluginsSvg/>
                        </div>
                        <h4>
                            <FormattedMessage
                                id='next_steps_view.tips.connectPlugins'
                                defaultMessage='Connect your favorite tools'
                            />
                        </h4>
                        <FormattedMessage
                            id='next_steps_view.tips.connectPlugins.text'
                            defaultMessage='Install Mattermost plugins to connect with your favorite tools'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={openPluginMarketplace}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins.button'
                                defaultMessage='Add plugins'
                            />
                        </button>
                    </div>
                </Card>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <div className='Card__image'>
                            <IncidentsSvg/>
                        </div>
                        <h4>
                            <FormattedMessage
                                id='next_steps_view.tips.resolveIncidents'
                                defaultMessage='Resolve incidents faster'
                            />
                        </h4>
                        <FormattedMessage
                            id='next_steps_view.tips.resolveIncidents.text'
                            defaultMessage='Resolve incidents faster with Mattermost Playbooks.'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={() => openIncidentsPlugin(props.isAdmin, props.team)}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.resolveIncidents.button'
                                defaultMessage='Open playbooks'
                            />
                        </button>
                    </div>
                </Card>
            </>
        );
    } else if (!Utils.isMobile() && !props.isAdmin) {
        nonMobileTips = (
            <>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h4>
                            <FormattedMessage
                                id='next_steps_view.tips.configureLogins'
                                defaultMessage='See who else is here'
                            />
                        </h4>
                        <FormattedMessage
                            id='next_steps_view.tips.configureLogin.texts'
                            defaultMessage='Browse or search through the team members directory'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={() => openViewMembersModal(dispatch)}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.viewMembers'
                                defaultMessage='View team members'
                            />
                        </button>
                    </div>
                </Card>
                <Card expanded={true}>
                    <div className='Card__body'>
                        <h4>
                            <FormattedMessage
                                id='next_steps_view.tips.addPluginss'
                                defaultMessage='Learn Keyboard Shortcuts'
                            />
                        </h4>
                        <FormattedMessage
                            id='next_steps_view.tips.addPlugins.texts'
                            defaultMessage='Work more efficiently with Keyboard Shortcuts in Mattermost.'
                        />
                        <button
                            className='NextStepsView__button NextStepsView__finishButton primary'
                            onClick={toggleShortcutsModal}
                        >
                            <FormattedMessage
                                id='next_steps_view.tips.addPlugins.buttons'
                                defaultMessage='See shortcuts'
                            />
                        </button>
                    </div>
                </Card>
            </>
        );
    }

    let channelsSection;
    if (props.isAdmin) {
        channelsSection = (
            <Card expanded={true}>
                <div className='Card__body'>
                    <div className='Card__image'>
                        <DocumentsSvg/>
                    </div>
                    <h4>
                        <FormattedMessage
                            id='next_steps_view.tips.manageWorkspace'
                            defaultMessage='Manage your workspace'
                        />
                    </h4>
                    <FormattedMessage
                        id='next_steps_view.tips.manageWorkspace.text'
                        defaultMessage='Visit the system console to manage users, teams, and plugins'
                    />
                    <button
                        onClick={() => openAdminConsole(props.isAdmin)}
                        className='NextStepsView__button NextStepsView__finishButton primary'
                    >
                        <FormattedMessage
                            id='next_steps_view.tips.manageWorkspace.button'
                            defaultMessage='Open the system console'
                        />
                    </button>
                </div>
            </Card>
        );
    } else {
        channelsSection = (
            <Card expanded={true}>
                <div className='Card__body'>
                    <h4>
                        <FormattedMessage
                            id='next_steps_view.tips.exploreChannels'
                            defaultMessage='Explore channels'
                        />
                    </h4>
                    <FormattedMessage
                        id='next_steps_view.tips.exploreChannels.text'
                        defaultMessage='See the channels in your workspace or create a new channel.'
                    />
                    <button
                        className='NextStepsView__button NextStepsView__finishButton primary'
                        onClick={() => openMoreChannels(dispatch)}
                    >
                        <FormattedMessage
                            id='next_steps_view.tips.exploreChannels.button'
                            defaultMessage='Browse channels'
                        />
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <div
            className={classNames(
                'NextStepsView__viewWrapper NextStepsView__completedView',
                {
                    completed: props.showFinalScreen,
                    animating: props.animating,
                },
            )}
            onTransitionEnd={props.stopAnimating}
        >
            <header className='NextStepsView__header'>
                <div className='NextStepsView__header-headerText'>
                    <h1 className='NextStepsView__header-headerTopText'>
                        <FormattedMessage
                            id='next_steps_view.tipsAndNextSteps'
                            defaultMessage='Tips & Next Steps'
                        />
                    </h1>
                    <h2 className='NextStepsView__header-headerBottomText'>
                        <FormattedMessage
                            id='next_steps_view.otherAreasToExplore'
                            defaultMessage='A few other areas to explore'
                        />
                    </h2>
                </div>
                <CloseIcon
                    id='closeIcon'
                    className='close-icon'
                    onClick={() => closeNextSteps(dispatch)}
                />
            </header>
            <div className='NextStepsView__body'>
                <div className='NextStepsView__nextStepsCards'>
                    {nonMobileTips}
                    {channelsSection}
                </div>
                <DownloadSection isFirstAdmin={props.isFirstAdmin}/>
            </div>
        </div>
    );
}
