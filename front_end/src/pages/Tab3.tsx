import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonButton, IonItem, IonLabel, IonIcon, IonList
} from '@ionic/react';
import { logOutOutline, personCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Tab3: React.FC = () => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('user');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem lines="none">
            <IonIcon slot="start" icon={personCircleOutline} />
            <IonLabel>Configuración de Perfil</IonLabel>
          </IonItem>

          <IonItem lines="none">
            <IonIcon slot="start" icon={shieldCheckmarkOutline} />
            <IonLabel>Privacidad y Seguridad</IonLabel>
          </IonItem>

          <div style={{ marginTop: '40px', padding: '0 16px' }}>
            <IonButton
              expand="block"
              color="danger"
              fill="outline"
              onClick={handleLogout}
            >
              <IonIcon slot="start" icon={logOutOutline} />
              Cerrar Sesión
            </IonButton>
          </div>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;