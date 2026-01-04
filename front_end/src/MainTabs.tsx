import React from 'react';
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonIcon, IonLabel } from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { homeOutline, settingsOutline, personOutline } from "ionicons/icons";
import Tab1 from "./pages/Tab1";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";

const MainTabs: React.FC = () => (
    <IonTabs>
        <IonRouterOutlet>
            <Route exact path="/tabs/tab1" component={Tab1} />
            <Route exact path="/tabs/tab2" component={Tab2} />
            <Route exact path="/tabs/tab3" component={Tab3} />
            <Route exact path="/tabs">
                <Redirect to="/tabs/tab1" />
            </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tabs/tab1">
                <IonIcon icon={homeOutline} />
                <IonLabel>Inicio</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tabs/tab2">
                <IonIcon icon={personOutline} />
                <IonLabel>Perfil</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tabs/tab3">
                <IonIcon icon={settingsOutline} />
                <IonLabel>Ajustes</IonLabel>
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
);

export default MainTabs;