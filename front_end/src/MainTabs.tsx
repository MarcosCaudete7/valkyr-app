import React from 'react';
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonIcon, IonLabel } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { homeOutline, settingsOutline, personOutline, addOutline, barbellOutline } from "ionicons/icons";
import MyRoutines from "./pages/Routines";
import CreateRoutine from "./pages/CreateRoutine";
import Tab3 from "./pages/Tab3";
import RoutineDetail from "./Details/RoutineDetail";

const MainTabs: React.FC = () => (
    <IonTabs>
        <IonRouterOutlet>
            <Route exact path="/tabs/myroutines" component={MyRoutines} />
            <Route exact path="/tabs/create" component={CreateRoutine} />
            <Route exact path="/tabs/tab3" component={Tab3} />
            <Route exact path="/tabs/routine/:id" component={RoutineDetail} />
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
                <IonLabel>Nueva Rutina</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tabs/tab3">
                <IonIcon icon={settingsOutline} />
                <IonLabel>Ajustes</IonLabel>
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
);

export default MainTabs;