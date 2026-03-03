import React from 'react';
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonIcon, IonLabel } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { settingsOutline, addOutline, barbellOutline, peopleOutline, personOutline } from "ionicons/icons";
import MyRoutines from "./pages/Routines";
import CreateRoutine from "./pages/CreateRoutine";
import RoutineDetail from "./Details/RoutineDetail";
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChatPage from './pages/ChatPage';
import SocialPage from './pages/SocialPage';
import Home from './pages/Home';

const MainTabs: React.FC = () => (
    <IonTabs>
        <IonRouterOutlet>
            <Route exact path="/tabs/home" component={Home} />
            <Route exact path="/tabs/myroutines" component={MyRoutines} />
            <Route exact path="/tabs/create" component={CreateRoutine} />
            <Route exact path="/tabs/settings" component={Settings} />
            <Route exact path="/tabs/profile" component={Profile} />
            <Route exact path="/tabs/profile/:targetId" component={Profile} />
            <Route exact path="/tabs/routine/:id" component={RoutineDetail} />
            <Route exact path="/tabs/social" component={SocialPage} />
            <Route exact path="/tabs/chat/:friendId/:friendName" component={ChatPage} />
            <Route exact path="/tabs">
                <Redirect to="/tabs/home" />
            </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/tabs/home">
                <IonIcon icon={personOutline} /> {/* Reuse any appealing icon for Home if needed */}
                <IonLabel>Inicio</IonLabel>
            </IonTabButton>

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
        </IonTabBar>
    </IonTabs>
);

export default MainTabs;