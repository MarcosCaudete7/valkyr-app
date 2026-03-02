import React from 'react';
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonIcon, IonLabel } from "@ionic/react";
import { Route, Redirect, useParams } from "react-router-dom";
import { settingsOutline, addOutline, barbellOutline, peopleOutline } from "ionicons/icons";
import MyRoutines from "./pages/Routines";
import CreateRoutine from "./pages/CreateRoutine";
import RoutineDetail from "./Details/RoutineDetail";
import Settings from './pages/Settings';
import ChatPage from './pages/ChatPage';
import SocialPage from './pages/SocialPage';

const ChatPageWrapper: React.FC = () => {
    const { friendId, friendName } = useParams<{ friendId: string; friendName: string }>();
    const userStr = localStorage.getItem('user');
    const myId = userStr ? JSON.parse(userStr).id : '';

    return <ChatPage myId={myId} friendId={friendId} friendName={friendName} />;
};

const MainTabs: React.FC = () => (
    <IonTabs>
        <IonRouterOutlet>
            <Route exact path="/tabs/myroutines" component={MyRoutines} />
            <Route exact path="/tabs/create" component={CreateRoutine} />
            <Route exact path="/tabs/settings" component={Settings} />
            <Route exact path="/tabs/routine/:id" component={RoutineDetail} />
            <Route exact path="/tabs/social" component={SocialPage} />
            <Route exact path="/tabs/chat/:friendId/:friendName" component={ChatPage} />
            <Route exact path="/tabs">
                <Redirect to="/tabs/myroutines" />
            </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
            <IonTabButton tab="myroutines" href="/tabs/myroutines">
                <IonIcon icon={barbellOutline} />
                <IonLabel>Rutinas</IonLabel>
            </IonTabButton>

            <IonTabButton tab="create" href="/tabs/create">
                <IonIcon icon={addOutline} />
                <IonLabel>Crear</IonLabel>
            </IonTabButton>

            <IonTabButton tab="social" href="/tabs/social">
                <IonIcon icon={peopleOutline} />
                <IonLabel>Comunidad</IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/tabs/settings">
                <IonIcon icon={settingsOutline} />
                <IonLabel>Ajustes</IonLabel>
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
);

export default MainTabs;