import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import MainTabs from './MainTabs';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { cryptoService } from './services/cryptoService';
import { supabase } from './supabaseClient';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {

  // Efecto global para arrancar servicios en segundo plano (FCM y E2EE)
  React.useEffect(() => {
    const initServices = async () => {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const user = JSON.parse(rawUser);

        // 1. Generar Llaves Cifrado E2E
        if (user.id) {
          await cryptoService.generateAndPublishKeys(user.id);
        }

        // 2. Registrar Notificaciones Push (Solo nativo)
        if (Capacitor.isNativePlatform()) {
          try {
            let permStatus = await PushNotifications.checkPermissions();
            if (permStatus.receive === 'prompt') {
              permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive === 'granted') {
              await PushNotifications.register();
            }

            PushNotifications.addListener('registration', async (token) => {
              console.log('Push registration success, token: ' + token.value);
              if (user.id) {
                // Guardar el device_token en Supabase
                await supabase.from('profiles').upsert({ id: user.id, push_token: token.value });
              }
            });

            PushNotifications.addListener('registrationError', (error: any) => {
              console.error('Error on registration: ' + JSON.stringify(error));
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
              console.log('Push received: ', notification);
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
              console.log('Push action performed: ', notification);
            });
          } catch (e) {
            console.error("Error inicializando Push Notifications", e);
          }
        }
      }
    };

    initServices();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <Route path="/tabs" render={() => {
            const hasToken = localStorage.getItem('token');
            return hasToken ? <MainTabs /> : <Redirect to="/login" />
          }} />

          <Route exact path="/" render={() => {
            const hasToken = localStorage.getItem('token');
            return hasToken ? <Redirect to="/tabs/myroutines" /> : <Redirect to="/login" />
          }} />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;