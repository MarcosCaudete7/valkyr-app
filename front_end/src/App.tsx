import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import MainTabs from './MainTabs';

/* ... tus imports de CSS ... */
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

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          {/* Rutas Públicas */}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          {/* Ruta Protegida: /tabs */}
          <Route path="/tabs" render={() => {
            // Verificamos el token, no solo el user, para ser más seguros
            const hasToken = localStorage.getItem('token');
            return hasToken ? <MainTabs /> : <Redirect to="/login" />
          }} />

          {/* REDIRECCIÓN INTELIGENTE EN LA RAÍZ */}
          {/* Esto rompe el bucle: Si ya estás dentro, no te manda al login */}
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