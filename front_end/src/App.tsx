import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import MainTabs from './MainTabs';


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

  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          {/* CAMBIO: Usamos render con lógica explícita */}
          <Route path="/tabs" render={() => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            console.log('App.tsx: Verificando auth para /tabs', { user: !!user, token: !!token });
            // Solo dejamos pasar si hay usuario Y token
            return (user && token) ? <MainTabs /> : <Redirect to="/login" />
          }} />

          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;