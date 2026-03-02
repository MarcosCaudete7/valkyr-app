import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { IonContent, IonPage, IonInput, IonButton, IonList, IonItem, IonLabel } from '@ionic/react';

const ChatPage: React.FC<{ myId: string, friendId: string, friendName: string }> = ({ myId, friendId, friendName }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq."${myId}",receiver_id.eq."${friendId}"),and(sender_id.eq."${friendId}",receiver_id.eq."${myId}")`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_${myId}_${friendId}`)
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
      }, (payload) => {
        const msg = payload.new;
        if ((msg.sender_id === myId && msg.receiver_id === friendId) || 
            (msg.sender_id === friendId && msg.receiver_id === myId)) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, friendId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert([
      { 
        sender_id: myId, 
        receiver_id: friendId, 
        content: newMessage 
      }
    ]);

    setNewMessage('');
  };

  return (
    <IonPage>
      <IonContent>
        <h2>Chat con {friendName}</h2>
        <IonList>
          {messages.map((m) => (
            <IonItem key={m.id} lines="none">
              <div slot={m.sender_id === myId ? 'end' : 'start'} 
                   style={{ background: m.sender_id === myId ? '#3880ff' : '#e0e0e0', padding: '10px', borderRadius: '10px' }}>
                <IonLabel>{m.content}</IonLabel>
              </div>
            </IonItem>
          ))}
        </IonList>
        
        <div style={{ display: 'flex', padding: '10px' }}>
          <IonInput value={newMessage} placeholder="Escribe un mensaje..." onIonInput={e => setNewMessage(e.detail.value!)} />
          <IonButton onClick={sendMessage}>Enviar</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatPage;