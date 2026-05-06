import React from 'react';
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonIcon, IonLabel } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { gridOutline, restaurantOutline, storefrontOutline, bodyOutline } from 'ionicons/icons';
import NutritionDashboard from './pages/nutrition/NutritionDashboard';
import FoodDiary from './pages/nutrition/FoodDiary';
import Pantry from './pages/nutrition/Pantry';
import BodyMeasures from './pages/nutrition/BodyMeasures';

const NutritionTabs: React.FC = () => (
    <IonTabs>
        <IonRouterOutlet>
            <Route exact path="/nutrition/dashboard" component={NutritionDashboard} />
            <Route exact path="/nutrition/diary" component={FoodDiary} />
            <Route exact path="/nutrition/pantry" component={Pantry} />
            <Route exact path="/nutrition/measures" component={BodyMeasures} />
            <Route exact path="/nutrition">
                <Redirect to="/nutrition/dashboard" />
            </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
            <IonTabButton tab="dashboard" href="/nutrition/dashboard">
                <IonIcon icon={gridOutline} />
                <IonLabel>Resumen</IonLabel>
            </IonTabButton>
            <IonTabButton tab="diary" href="/nutrition/diary">
                <IonIcon icon={restaurantOutline} />
                <IonLabel>Diario</IonLabel>
            </IonTabButton>
            <IonTabButton tab="pantry" href="/nutrition/pantry">
                <IonIcon icon={storefrontOutline} />
                <IonLabel>Despensa</IonLabel>
            </IonTabButton>
            <IonTabButton tab="measures" href="/nutrition/measures">
                <IonIcon icon={bodyOutline} />
                <IonLabel>Medidas</IonLabel>
            </IonTabButton>
        </IonTabBar>
    </IonTabs>
);

export default NutritionTabs;
